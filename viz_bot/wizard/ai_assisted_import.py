import logging
_logger = logging.getLogger(__name__)

import requests
import json
import re
from textwrap import dedent

import dateutil.parser as date_parser
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

from odoo import _, fields, models
from odoo.exceptions import UserError

CODE_BLOCK_PATTERN = r"```[ \t]*(\w+)?[ \t]*\r?\n(.*?)\r?\n[ \t]*```"

class AiAssistedImport(models.TransientModel):
    _name = 'vizbot.ai.import.purchase'
    _description = "AI assisted import"

    DEFAULT_PROMPT = """\
Convert the purchase order into json containing the following keys:
```
{
    'order_number': string,
    'order_date': date,
    'lines': [
        {
            'product_code': string,
            'description': string,
            'quantity': number,
            'unit_price: number
        }
    ]
}
```
Rules:
1. The 'lines' key are an array, it can contain multiple products.
2. Skip key if it's not available in the purchase order
3. Do not extract other data, i.e., do not add new key.
4. Reply only with the json.
    """

    prompt = fields.Text("Prompt", default=dedent(DEFAULT_PROMPT))
    file_for_import = fields.Binary(string="Select File")
    ai_response_text = fields.Text("AI Response")
    info_message = fields.Char("Info")
    generated_po_url = fields.Char("Url")

    def _create_link(self, po_id):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        menu_id = self.env.ref('purchase.menu_purchase_form_action').id
        link = f"{base_url}/web#menu_id={menu_id}&model=purchase.order&view_type=form&id={po_id}"
        return link

    def action_import_from_image(self):
        if not (self.file_for_import):
            raise UserError(_("Please upload image file."))

        poip = self.env["purchase.order.import.image"].create({
            'x_image': self.file_for_import
        })

        self.env.cr.commit()

        odoo_base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        image_full_url = f"{odoo_base_url}{poip.x_image_url}"

        config_parameter = self.env["ir.config_parameter"].sudo()
        ai_server_address = config_parameter.get_param("viz_bot.ai_server_address")
        ai_server_url = f"http://{ai_server_address}/infer"

        headers = {
            'accept': 'application/json',
        }

        params = {
            'model': 'internvl',
            'prompt_text': self.prompt,
            'image_url': image_full_url,
        }

        res = requests.post(ai_server_url, json=params, headers=headers)

        res_text = json.loads(res.content)["result"]
        self.ai_response_text = res_text

        match = re.findall(CODE_BLOCK_PATTERN, res_text, flags=re.DOTALL)
        lang = match[0][0]
        code = match[0][1]

        info_msg = []
        if lang == 'json':
            default_supplier = config_parameter.get_param("viz_bot.default_supplier")
            data = json.loads(code)

            lines = []
            for l in data["lines"]:
                product_code = l["product_code"]
                product = self.env["product.product"].search([("default_code", "=", product_code)], limit=1)
                if not product:
                    info_msg.append(f"Product not found, skipped: {product_code}")

                lines.append((0,0,{
                    'product_id': product.id,
                    'product_qty': l["quantity"],
                    'price_unit': l["unit_price"]
                }))

            order_date = date_parser.parse(data["order_date"])
            po = self.env["purchase.order"].create({
                'partner_id': default_supplier,
                'partner_ref': data["order_number"],
                'date_order': order_date.strftime(DEFAULT_SERVER_DATETIME_FORMAT),
                'order_line': lines
            })
            info_msg.append("Click the following url to open the generated purchase order:")
            self.info_message = ",".join(info_msg)
            self.generated_po_url = self._create_link(po.id)

        return {
          'type': 'ir.actions.act_window',
          'res_model': 'vizbot.ai.import.purchase',
          'name':'Import from Image',
          'view_mode': 'form',
          'view_type': 'form',
          'target': 'new',
          'res_id': self.id
      }