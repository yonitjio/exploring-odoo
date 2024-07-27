import uuid
from odoo import _, fields, models

class PurchaseOrderImportImage(models.Model):
    _name = "purchase.order.import.image"
    _description = "Source image from which the purchase order was imported from."

    def _compute_uuid(self):
        return str(uuid.uuid4())

    def _compute_image_url(self):
        for rec in self:
            rec.x_image_url = '/viz_bot/image/purchase.order.import.image/%s' % (rec.id)

    x_image = fields.Binary("Image")
    x_image_url = fields.Char("Url", compute="_compute_image_url")
    uuid = fields.Char("Uuid", default=_compute_uuid)

class PurchaseOrder(models.Model):
    _inherit = "purchase.order"

    purchase_order_image_id = fields.Integer(string="Imported from")
