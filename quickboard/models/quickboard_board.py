"""
THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo

This software is released under the MIT License.
SPDX-License-Identifier: MIT
https://opensource.org/licenses/MIT

THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
"""

from odoo import fields, models

class QuickboardBoard(models.Model):
    _name = "quickboard.board"
    _description = "Quickboard"
    _order = "sequence, id"

    name = fields.Char(string="Name", required=True, default="My Quickboard")
    sequence = fields.Integer(string="Sequence", default=10)
    item_ids = fields.One2many("quickboard.item", "board_id", string="Items")