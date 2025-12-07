# -*- coding: utf-8 -*-
import logging

import json
from jsonschema import validate

from odoo import _, fields, models
from odoo.exceptions import ValidationError

from .ai import QuickboardAiGenerator
from .ai.consts import QUICKBOARD_DATA_UI_JSON_SCHEMA

_logger = logging.getLogger(__name__)

class QuickboardGenerator(models.TransientModel):
    _name = "quickboard.generator"

    model_ids = fields.Many2many('ir.model', string='Model')
    layout_by_ai = fields.Boolean("Layout by AI", default=False)

    def action_generate_quickboard(self):
        if len(self.model_ids.ids) < 1:
            return {
                    'name': _('Generate Quickboard'),
                    'type': 'ir.actions.act_window',
                    'res_model': 'quickboard.generator',
                    'view_type': 'form',
                    'view_mode': 'form',
                    'res_id': self.id,
                    'target': 'new',
                }

        screen_width = self.env.context.get("screen_width")
        screen_height = self.env.context.get("screen_height")
        cell_width = self.env.context.get("cell_width")
        cell_height = self.env.context.get("cell_height")

        try:
            gen = QuickboardAiGenerator(self.env)
            quickboard = gen.generate_quickboard(
                    self.model_ids,
                    self.layout_by_ai,
                    screen_width,
                    screen_height,
                    cell_width,
                    cell_height
                )
            quickboard_json = json.loads(quickboard)
            validate(quickboard_json, QUICKBOARD_DATA_UI_JSON_SCHEMA)

            quickboard_item = self.env['quickboard.item']
            items = quickboard_item.search([])
            for o in items:
                o.unlink()

            for o in quickboard_json:
                _logger.info(f"Creating quickboard item: {o}")

                model = self.env["ir.model"].search([("model", "=", o["model"])])
                value_field = self.env["ir.model.fields"].search([("model_id", "=", model.id), ("name", "=", o["value_field"])])

                if not value_field.id:
                    raise Exception("AI generated invalid field: %s." % {o["value_field"]})

                # Sometime AI choose the wrong aggregate function, we could return the result to AI with json schema validation.
                # But, it would mean failing the result and making another attempt, the alternative is we just fix it here.
                if value_field.ttype not in ['float', 'integer', 'monetary'] and o["aggregate_function"] != "count":
                    o["aggregate_function"] = "count"

                vals = {
                        "name": o["name"],
                        "model_id": model.id,
                        "icon": o["icon"],
                        "type": o["type"],
                        "value_field_id": value_field.id,
                        "aggregate_function": o["aggregate_function"],
                        "x_pos": o["x_pos"],
                        "y_pos": o["y_pos"],
                        "height": o["height"],
                        "width": o["width"]
                    }
                if o["type"] == "basic":
                    vals.update({
                        "text_color": o["text_color"] if o["text_color"] else "#000000",
                        "background_color": o["background_color"] if o["background_color"] else "#aaaaaa",
                    })
                elif o["type"] == "chart":
                    dimension_field = self.env["ir.model.fields"].search([("model_id", "=", model.id), ("name", "=", o["dimension_field"])])
                    if not dimension_field.id:
                        raise Exception("AI generated invalid field: %s." % {o["dimension_field"]})

                    vals.update({
                        "dimension_field_id": dimension_field.id,
                        "chart_type": o["chart_type"],
                    })

                    if "datetime_granularity" in o:
                        vals.update({
                            "datetime_granularity": o["datetime_granularity"]
                        })
                elif o["type"] == "list":
                    dimension_field = self.env["ir.model.fields"].search([("model_id", "=", model.id), ("name", "=", o["dimension_field"])])
                    if not dimension_field.id:
                        raise Exception("AI generated invalid field: %s." % {o["dimension_field"]})

                    vals.update({
                        "dimension_field_id": dimension_field.id,
                        "list_row_limit": o["list_row_limit"]
                    })

                    if "datetime_granularity" in o:
                        vals.update({
                            "datetime_granularity": o["datetime_granularity"]
                        })

                quickboard_item.with_context(ai_generation=True).create(vals)
        except Exception as e:
            _logger.error("Error generating quickboard", e)
            raise ValidationError(_("Unfortunately the AI didn't generate valid quickboard. Please try again."))

        for rec in self:
            self.env["bus.bus"]._sendone("quickboard", "quickboard_updated", {})

        return True