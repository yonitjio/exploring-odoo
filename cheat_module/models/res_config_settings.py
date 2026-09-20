# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines

from odoo import _, fields, models, api


# The simplest way to store configuration settings is to use res.company.
class ResCompany(models.Model):
    _inherit =  'res.company'

    cheat_setting = fields.Boolean(string='Cheat setting')


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # Related parameter links this field to the res.company field above
    cheat_setting = fields.Boolean(related='company_id.cheat_setting', readonly=False)