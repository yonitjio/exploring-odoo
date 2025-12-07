# -*- coding: utf-8 -*-
{
    "name": "POS Custom Email Template",
    'summary': """POS custom email template""",
    'description': """
        Enable custom email template for POS.
    """,
    "author": "Yoni Tjio",
    "category": "Point of Sale",
    "version": "17.0.1.0.0",
    "depends": [
        "point_of_sale",
    ],
    "data":  [
        'security/ir.model.access.csv',
        'data/pos_email_receipt.xml',
        'wizard/email_generator_test.xml'
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "license":"Other proprietary",
}
