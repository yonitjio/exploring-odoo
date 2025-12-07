# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class RecordTriggerNode(BaseNode):
    TRIGGER_METHOD_NAME = ""

    @staticmethod
    def _patch(model, name, method):
        ModelClass = model.env.registry[model._name]
        method.origin = getattr(ModelClass, name)
        setattr(ModelClass, name, method)

    @staticmethod
    def _unpatch(model, name):
        ModelClass = model.env.registry[model._name]
        try:
            delattr(ModelClass, name)
        except AttributeError:
            pass
