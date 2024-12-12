# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines

from odoo import _, models, api, fields
from odoo.tools import ormcache

class IrConfigParameter(models.Model):
    _inherit = 'ir.config_parameter'

    @api.model
    def get_param_with_last_update(self, key, default_value=False, default_date=fields.Datetime.now()):
        self.browse().check_access('read')
        default_value, default_date = self._get_param_with_last_update(key)
        return default_value, default_date

    @api.model
    def _get_param_with_last_update(self, key):
        self.env.cr.execute("SELECT value, write_date FROM ir_config_parameter WHERE key = %s", [key])
        result = self.env.cr.fetchone()
        if result:
            return result[0], result[1]
        else:
            return False, False
