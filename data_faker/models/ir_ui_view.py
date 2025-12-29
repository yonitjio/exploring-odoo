"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

import warnings

from odoo import fields, models, _
from odoo.tools.view_validation import get_expression_field_names


class View(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[('faker', "Faker")])

    def _get_view_info(self):
        return {'faker': {'icon': 'fa fa-smile-o'}} | super()._get_view_info()

    def _postprocess_tag_field(self, node, name_manager, node_info):
        super()._postprocess_tag_field(node, name_manager, node_info)

        name = node.get('name')

        field = name_manager.model._fields.get(name)

        if field:
            for child in node:
                if child.tag == "faker":
                    node_info['children'] = []
                    self._postprocess_view(child, field.comodel_name, node_info=node_info)


    def _validate_tag_field(self, node, name_manager, node_info):
        super()._validate_tag_field(node, name_manager, node_info)

        name = node.get('name')

        field = name_manager.model._fields.get(name)

        if field:
            for child in node:
                if child.tag == "faker":
                    node.remove(child)
                    self._validate_view(child, field.comodel_name, view_type=child.tag, node_info=node_info)
