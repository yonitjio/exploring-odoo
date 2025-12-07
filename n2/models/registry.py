"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging

_logger = logging.getLogger(__name__)

from odoo import models, fields


class N2Registry(models.Model):
    _name = "n2.registry"
    _description = "N2 Registry"
    _rec_name = "key"

    category = fields.Char("Category", required=True)
    key = fields.Char("Key", required=True)
    value = fields.Char("Value", required=True)

    _category_key_uniq = models.Constraint(
        "unique (category, key)", "Key already exists in category!"
    )
