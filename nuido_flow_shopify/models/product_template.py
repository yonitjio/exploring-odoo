# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import api, fields, models

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    sync_to_shopify = fields.Boolean("Sync. to Shopify", default=False)
    shopify_ref_id = fields.Char("Shopify Ref. Id")
    shopify_image = fields.Image("Shopify Image", max_width=1920, max_height=1920)
    shopify_image_url = fields.Char("Shopify Image Url", compute="_compute_shopify_image_prop", copy=False)
    shopify_image_name = fields.Char("Shopify Image Name", compute="_compute_shopify_image_prop", copy=False)

    def _set_shopify_image_to_public(self, id):
        img_attachment = self.env["ir.attachment"].search([
                ("res_model", "=", "product.template"),
                ("res_field", "=", "shopify_image"),
                ("res_id", "=", id)
            ], limit=1)
        if (len(img_attachment) > 0):
            img_attachment.public = True

    @api.model_create_multi
    def create(self, vals_list):
        templates = super(ProductTemplate, self).create(vals_list)
        for template in templates:
            self._set_shopify_image_to_public(template.id)
        return templates

    def write(self, vals):
        templates = super(ProductTemplate, self).write(vals)
        if 'shopify_image' in vals:
            for template in self:
                self._set_shopify_image_to_public(template.id)
            self.env['product.template'].invalidate_model([
                'shopify_image',
            ])
        return templates

    @api.depends('shopify_image')
    def _compute_shopify_image_prop(self):
        for rec in self:
            base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
            rec.shopify_image_url = ""
            rec.shopify_image_name = ""
            if rec.shopify_image:
                img_attachment = self.env["ir.attachment"].search([
                        ("res_model", "=", "product.template"),
                        ("res_field", "=", "shopify_image"),
                        ("res_id", "=", rec.id)
                    ], limit=1)
                if (len(img_attachment) > 0):
                    rec.shopify_image_name = rec.name.replace(" ", "-") + "." + img_attachment.mimetype.replace("image/", "")
                    rec.shopify_image_url = f"{base_url}/web/image/{img_attachment.id}/{rec.shopify_image_name}"
