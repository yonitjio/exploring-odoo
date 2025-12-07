# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# Most of this code is copied from the original Autogen FunctionTool related files.

import asyncio
import functools
import inspect
import typing

from functools import partial

from typing import (
    Annotated,
    Any,
    Callable,
    Dict,
    Type,
    Union,
    Sequence,
    cast,
    get_args,
    get_origin,
)

from pydantic import BaseModel, Field, create_model
from pydantic_core import PydanticUndefined
from typing_extensions import Self

from autogen_core import CancellationToken, Component
from autogen_core.tools import BaseTool
from autogen_core.code_executor import Import

def get_typed_signature(call: Callable[..., Any]) -> inspect.Signature:
    """Get the signature of a function with type annotations.

    Args:
        call: The function to get the signature for

    Returns:
        The signature of the function with type annotations
    """
    signature = inspect.signature(call)
    globalns = getattr(call, "__globals__", {})
    func_call = call.func if isinstance(call, partial) else call
    type_hints = typing.get_type_hints(func_call, globalns, include_extras=True)
    typed_params = [
        inspect.Parameter(
            name=param.name,
            kind=param.kind,
            default=param.default,
            annotation=type_hints[param.name],
        )
        for param in signature.parameters.values()
    ]
    return_annotation = type_hints.get("return", inspect.Signature.empty)
    typed_signature = inspect.Signature(typed_params, return_annotation=return_annotation)
    return typed_signature

def normalize_annotated_type(type_hint: Type[Any]) -> Type[Any]:
    """Normalize typing.Annotated types to the inner type."""
    if get_origin(type_hint) is Annotated:
        # Extract the inner type from Annotated
        return get_args(type_hint)[0]  # type: ignore
    return type_hint

def type2description(k: str, v: Union[Annotated[Type[Any], str], Type[Any]]) -> str:
    # handles Annotated
    if hasattr(v, "__metadata__"):
        retval = v.__metadata__[0]
        if isinstance(retval, str):
            return retval
        else:
            raise ValueError(f"Invalid description {retval} for parameter {k}, should be a string.")
    else:
        return k

def args_base_model_from_signature(name: str, sig: inspect.Signature) -> Type[BaseModel]:
    fields: Dict[str, tuple[Type[Any], Any]] = {}
    for param_name, param in sig.parameters.items():
        # This is handled externally
        if param_name == "cancellation_token":
            continue

        if param_name == "odoo_env":
            continue

        if param.annotation is inspect.Parameter.empty:
            raise ValueError("No annotation")

        type = normalize_annotated_type(param.annotation)
        description = type2description(param_name, param.annotation)
        default_value = param.default if param.default is not inspect.Parameter.empty else PydanticUndefined

        fields[param_name] = (type, Field(default=default_value, description=description))

    return cast(BaseModel, create_model(name, **fields))  # type: ignore

class OdooFunctionToolConfig(BaseModel):
    """Configuration for a function tool."""

    source_code: str
    name: str
    description: str
    global_imports: Sequence[Import]
    has_cancellation_support: bool

class OdooFunctionTool(BaseTool[BaseModel, BaseModel], Component[OdooFunctionToolConfig]):
    component_provider_override = "nuido_flow_ai.OdooFunctionTool"
    component_config_schema = OdooFunctionToolConfig

    def __init__(
        self,
        func: Callable[..., Any],
        description: str,
        name: str | None = None,
        global_imports: Sequence[Import] = [],
        strict: bool = False,
        odoo_env: object = None
    ) -> None:
        self._func = func
        self._global_imports = global_imports
        self._signature = get_typed_signature(func)
        func_name = name or func.func.__name__ if isinstance(func, functools.partial) else name or func.__name__
        args_model = args_base_model_from_signature(func_name + "args", self._signature)
        self._has_cancellation_support = "cancellation_token" in self._signature.parameters
        return_type = self._signature.return_annotation

        self._odoo_env = odoo_env
        self._requires_odoo_env = "odoo_env" in self._signature.parameters

        super().__init__(args_model, return_type, func_name, description, strict)

    async def run(self, args: BaseModel, cancellation_token: CancellationToken) -> Any:
        kwargs = {}

        for name in self._signature.parameters.keys():
            if hasattr(args, name):
                kwargs[name] = getattr(args, name)

        if asyncio.iscoroutinefunction(self._func):
            if self._has_cancellation_support:
                if self._requires_odoo_env:
                    result = await self._func(**kwargs, cancellation_token=cancellation_token, odoo_env=self._odoo_env)
                else:
                    result = await self._func(**kwargs, cancellation_token=cancellation_token)
            else:
                if self._requires_odoo_env:
                    result = await self._func(**kwargs, odoo_env=self._odoo_env)
                else:
                    result = await self._func(**kwargs)
        else:
            if self._has_cancellation_support:
                if self._requires_odoo_env:
                    result = await asyncio.get_event_loop().run_in_executor(
                        None,
                        functools.partial(
                            self._func,
                            **kwargs,
                            cancellation_token=cancellation_token,
                            odoo_env=self._odoo_env
                        ),
                    )
                else:
                    result = await asyncio.get_event_loop().run_in_executor(
                        None,
                        functools.partial(
                            self._func,
                            **kwargs,
                            cancellation_token=cancellation_token,
                        ),
                    )
            else:
                if self._requires_odoo_env:
                    future = asyncio.get_event_loop().run_in_executor(None, functools.partial(self._func, **kwargs, odoo_env=self._odoo_env))
                    cancellation_token.link_future(future)
                    result = await future
                else:
                    future = asyncio.get_event_loop().run_in_executor(None, functools.partial(self._func, **kwargs))
                    cancellation_token.link_future(future)
                    result = await future

        return result

    def _to_config(self) -> OdooFunctionToolConfig:
        raise NotImplementedError

    @classmethod
    def _from_config(cls, config: OdooFunctionToolConfig) -> Self:
        raise NotImplementedError
