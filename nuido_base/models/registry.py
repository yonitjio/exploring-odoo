# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging
_logger = logging.getLogger(__name__)

from odoo import models, fields

class NuidoBaseRegistry(models.Model):
    _name = "nuido_base.registry"
    _description = "Nuido Registry"
    _rec_name = "key"

    category = fields.Char("Category", required=True)
    key = fields.Char("Key", required=True)
    value = fields.Char("Value", required=True)

    _sql_constraints = [
        ('category_key_uniq', 'unique (category, key)', "Key already exists in category!"),
    ]
