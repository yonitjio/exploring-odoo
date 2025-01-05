# -*- coding: utf-8 -*-
import os
import logging

from lxml import etree

from odoo import tools
from odoo.tools.view_validation import validate

_logger = logging.getLogger(__name__)

_schema_validator = {}

def _get_validator(view_type):
    """ Return a validator for the given view type, or None. """
    with tools.file_open(os.path.join('odoo_faker', 'rng', '%s_view.rng' % view_type)) as frng:
        try:
            relaxng_doc = etree.parse(frng)
            return etree.RelaxNG(relaxng_doc)
        except Exception:
            _schema_validator[view_type] = None
    return None


def _get_validator_from_cache(view_type):
    """ Return a validator for the given view type, or None. """
    if view_type not in _schema_validator:
        _schema_validator[view_type] = _get_validator(view_type)
    return _schema_validator[view_type]


@validate('faker')
def view_schema_validation(arch, **kwargs):
    """ Get RNG validator and validate RNG file."""
    validator = _get_validator_from_cache(arch.tag)
    if validator and not validator.validate(arch):
        for error in validator.error_log:
            _logger.error("%s", error)
        return False
    return True
