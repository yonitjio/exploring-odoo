# -*- coding: utf-8 -*-
import logging

from odoo import fields, models
_logger = logging.getLogger(__name__)

class View(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[
                ('hello', "Hello"),
                ('statistic', 'Statistic'),
                ('cheat', "Cheat")
            ]
        )

    def _validate_tag_cheat(self, node, name_manager, node_info):
        _logger.info("----------Cheat view validation")

    def _get_view_info(self):
        return {
                'hello': {'icon': 'fa fa-smile-o'},
                'statistic': {'icon': 'fa fa-info'},
                'cheat': {'icon': 'fa fa-bookmark-o'}
            } | super()._get_view_info()
