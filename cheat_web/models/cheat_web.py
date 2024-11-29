# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines


from odoo import _, fields, models, api

class CheatWeb(models.Model):
    _name = "cheat.web"

    char_field = fields.Char(string="Char Field", required=True)
    int_field = fields.Integer(string="Integer Field")

    def do_something(self):
        return { "result": "Ok" }

    def do_something_else(self, param1 = 0, param2 = 1):
        return {
                "result": "Ok",
                "param1": param1,
                "param2": param2
            }

    @api.model
    def do_model_method(self, param1 = 0, param2 = 1):
        return {
                "result": "Ok",
                "param1": param1,
                "param2": param2
            }
