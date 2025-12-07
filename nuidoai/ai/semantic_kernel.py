# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.api import Environment

from openai import AsyncOpenAI

from semantic_kernel.kernel import Kernel
from semantic_kernel.functions import KernelArguments, KernelFunctionFromPrompt

from semantic_kernel.agents import ChatCompletionAgent, AgentGroupChat
from semantic_kernel.agents.strategies import KernelFunctionSelectionStrategy, SequentialSelectionStrategy
from semantic_kernel.agents.strategies import KernelFunctionTerminationStrategy

from semantic_kernel.core_plugins import math_plugin

from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior

from odoo.addons.nuido_base.tools.function_tool import create_object

from . import consts

from .plugins import date_plugin, random_number_plugin
from ..models import registry_category as rcat

def create_chat_completion_agent(environment: Environment, create_function_registry, definitions, definition):
    kernel = Kernel()

    agent_name_key = "agent-name"
    agent_instruction_key = "agent-instruction"
    agent_plugin_key = "agent-plugin"
    chat_completion_service_key = "chat-completion-service"
    service_id_key = "service-id"

    if agent_plugin_key in definition:
        for plugin_def in definition[agent_plugin_key]:
            plugin = create_object(environment, create_function_registry, definitions, plugin_def["type"], plugin_def)
            kernel.add_plugin(plugin, plugin_def["type"])

    service_def = definition[chat_completion_service_key];
    service = create_object(environment, create_function_registry, definitions, service_def["type"], service_def)
    kernel.add_service(service)

    settings = kernel.get_prompt_execution_settings_from_service_id(service_id = service_def[service_id_key])
    settings.function_choice_behavior = FunctionChoiceBehavior.Auto()

    agent = ChatCompletionAgent(
            id = definition["id"],
            service = service,
            kernel = kernel,
            name = definition[agent_name_key],
            instructions = definition[agent_instruction_key],
            arguments = KernelArguments(settings)

        )

    return agent

def create_chat_group(environment, create_function_registry, definitions, definition):
    chat_group_agent_key = "chat-group-agent"
    chat_group_termination_strategy_key = "chat-group-termination-strategy"
    chat_group_selection_strategy_key = "chat-group-selection-strategy"

    agents = []
    for agent_def in definition[chat_group_agent_key]:
        agent = create_object(environment, create_function_registry, definitions, agent_def["type"], agent_def)
        agents.append(agent)


    termination_strategy_def = definition[chat_group_termination_strategy_key]
    termination_strategy = create_object(environment, create_function_registry, definitions, termination_strategy_def["type"], termination_strategy_def)

    selection_strategy_def = definition[chat_group_selection_strategy_key]
    selection_strategy = create_object(environment, create_function_registry, definitions, selection_strategy_def["type"], selection_strategy_def)

    chat = AgentGroupChat(
        agents = agents,
        selection_strategy = selection_strategy,
        termination_strategy = termination_strategy
    )

    return chat

def create_open_ai_chat_completion_service(environment, create_function_registry, definitions, definition):
    service_api_key = "service-api-key"
    service_base_url_key = "service-base-url"
    service_model_key = "service-model"
    service_id_key = "service-id"

    ai_client = AsyncOpenAI(
        api_key = definition[service_api_key],
        base_url = definition[service_base_url_key],
        default_headers = consts.DEFAULT_HEADER
    )

    service = OpenAIChatCompletion(
        ai_model_id = definition[service_model_key],
        service_id = definition[service_id_key],
        async_client = ai_client
    )

    return service

def create_date_plugin(environment, create_function_registry, definitions, definition):
    return date_plugin.DatePlugin(environment)

def create_math_plugin(environment, create_function_registry, definitions, definition):
    return math_plugin.MathPlugin()

def create_random_number_plugin(environment, create_function_registry, definitions, definition):
    return random_number_plugin.RandomNumberPlugin(environment)

def create_prompt_selection_strategy(environment, create_function_registry, definitions, definition):
    chat_completion_service_key = "chat-completion-service"
    strategy_name_key = "strategy-name"
    strategy_prompt_key = "strategy-prompt"
    strategy_initial_agent_key = "strategy-initial-agent"

    history_variable_name = environment["nuido_base.registry"].search_read([("category", "=", rcat.VARIABLE),
                                                                    ("key", "=", "HistoryVariableName")])[0]["value"]

    kernel = Kernel()

    service_def = definition[chat_completion_service_key];
    service = create_object(environment, create_function_registry, definitions, service_def["type"], service_def)
    kernel.add_service(service)

    kernel_function = KernelFunctionFromPrompt(
            function_name = definition[strategy_name_key],
            prompt = definition[strategy_prompt_key]
        )

    agent_def = definition[strategy_initial_agent_key]
    initial_agent = create_object(environment, create_function_registry, definitions, agent_def["type"], agent_def)

    strategy = KernelFunctionSelectionStrategy(
            kernel = kernel,
            function = kernel_function,
            initial_agent = initial_agent,
            result_parser = lambda result: str(result.value[0]).strip() if result.value[0] is not None else initial_agent.name,
            history_variable_name = history_variable_name
        )
    return strategy

def create_sequential_selection(environment, create_function_registry, definitions, definition):
    return SequentialSelectionStrategy()

def create_prompt_termination_strategy(environment, create_function_registry, definitions, definition):
    chat_completion_service_key = "chat-completion-service"
    strategy_name_key = "strategy-name"
    strategy_prompt_key = "strategy-prompt"
    strategy_termination_keyword_key = "strategy-termination-keyword"
    strategy_termination_agent_key = "strategy-termination-agent"
    strategy_max_iteration_key = "strategy-max-iteration"

    termination_keyword_placeholder = environment["nuido_base.registry"].search_read([("category", "=", rcat.VARIABLE),
                                                                    ("key", "=", "TerminationKeywordPlaceholder")])[0]["value"]
    history_variable_name = environment["nuido_base.registry"].search_read([("category", "=", rcat.VARIABLE),
                                                                    ("key", "=", "HistoryVariableName")])[0]["value"]

    kernel = Kernel()

    service_def = definition[chat_completion_service_key];
    service = create_object(environment, create_function_registry, definitions, service_def["type"], service_def)
    kernel.add_service(service)

    termination_keyword = definition[strategy_termination_keyword_key]

    prompt = definition[strategy_prompt_key]
    prompt = prompt.replace(f"{{{termination_keyword_placeholder}}}", f"{termination_keyword}")

    kernel_function = KernelFunctionFromPrompt(
            function_name = definition[strategy_name_key],
            prompt = prompt
        )

    agent_def = definition[strategy_termination_agent_key]
    termination_agent = create_object(environment, create_function_registry, definitions, agent_def["type"], agent_def)

    strategy = KernelFunctionTerminationStrategy(
            kernel = kernel,
            agents = [termination_agent],
            function = kernel_function,
            history_variable_name = history_variable_name,
            result_parser = lambda result: termination_keyword in str(result.value[0]).lower(),
            maximum_iterations = definition[strategy_max_iteration_key]
        )

    return strategy
