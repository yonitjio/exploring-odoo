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
    if view_type not in _schema_validator:
        with tools.file_open(os.path.join('cheat_web', 'rng', '%s_view.rng' % view_type)) as frng:
            try:
                relaxng_doc = etree.parse(frng)
                _schema_validator[view_type] = etree.RelaxNG(relaxng_doc)
            except Exception:
                _schema_validator[view_type] = None
    return _schema_validator[view_type]


@validate('hello', 'statistic', 'cheat')
def view_schema_validation(arch, **kwargs):
    """ Get RNG validator and validate RNG file."""
    validator = _get_validator(arch.tag)
    if validator and not validator.validate(arch):
        for error in validator.error_log:
            _logger.error("%s", error)
        return False
    return True
