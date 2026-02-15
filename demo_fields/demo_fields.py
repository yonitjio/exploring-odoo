from trytond.model import ModelSQL, ModelView, fields, DictSchemaMixin
from trytond.pool import Pool
from trytond.rpc import RPC


import logging
_logger = logging.getLogger(__name__)


class DemoFieldsChild(ModelSQL, ModelView):
    "Demo Fields Child"

    __name__ = "demo_fields.child"
    name = fields.Char("Name", required=True)
    demo_many2one_field = fields.Many2One("demo_fields.demo", "Many2One")


class DemoFieldsAnotherChild(ModelSQL, ModelView):
    "Demo Fields Another Child"

    __name__ = "demo_fields.another.child"
    name = fields.Char("Name", required=True)


class DemoFieldsTarget(ModelSQL, ModelView):
    "Demo Fields Target"

    __name__ = "demo_fields.target"
    name = fields.Char("Name", required=True)


class DemoFieldsSource(ModelSQL, ModelView):
    "Demo Fields Source"

    __name__ = "demo_fields.source"
    name = fields.Char("Name", required=True)


class DemoFieldsRelation(ModelSQL):
    "Demo Fields Relation"

    __name__ = "demo_fields.relation"
    demo = fields.Many2One("demo_fields.demo", "Demo")
    target = fields.Many2One("demo_fields.target", "Target")


class DemoFields(ModelSQL, ModelView):
    "Demo Fields - All Field Types"

    __name__ = "demo_fields.demo"

    name = fields.Char("Name", required=True)

    # Basic Types
    demo_boolean_field = fields.Boolean("Boolean")
    demo_integer_field = fields.Integer("Integer")
    demo_char_field = fields.Char("Char")
    demo_text_field = fields.Text("Text")
    demo_float_field = fields.Float("Float", digits=(None, 3))
    demo_numeric_field = fields.Numeric("Numeric", digits=(None, 5))

    # Date/Time Types
    demo_date_field = fields.Date("Date")
    demo_time_field = fields.Time("Time")
    demo_datetime_field = fields.DateTime("DateTime")
    demo_timestamp_field = fields.Timestamp("Timestamp")
    demo_timedelta_field = fields.TimeDelta("TimeDelta")

    # Selection Types
    demo_selection_field = fields.Selection(
        [
            ("opt1", "Option 1"),
            ("opt2", "Option 2"),
        ],
        "Selection",
    )
    demo_dynamic_selection_field = fields.Selection(
        "get_dynamic_selection_options",
        "Dynamic Selection",
    )
    demo_multiselection_field = fields.MultiSelection(
        [
            ("multi1", "Multi 1"),
            ("multi2", "Multi 2"),
            ("multi3", "Multi 3"),
        ],
        "MultiSelection",
    )
    demo_dynamic_multiselection_field = fields.MultiSelection(
        "get_dynamic_selection_options",
        "Dynamic MultiSelection",
    )

    # Relational Types
    demo_one2many_field = fields.One2Many(
        "demo_fields.child", "demo_many2one_field", "One2Many"
    )
    demo_many2many_field = fields.Many2Many(
        "demo_fields.relation", "demo", "target", "Many2Many"
    )
    demo_many2one_field = fields.Many2One("demo_fields.source", "Many2One")
    demo_reference_field = fields.Reference(
        "Reference",
        [
            (None, ""),
            ("demo_fields.another.child", "Another Child"),
        ],
    )

    # Special Types
    demo_binary_field = fields.Binary("Binary")
    demo_dict_field = fields.Dict("demo_fields.dict", "Dictionary")
    demo_function_field = fields.Function(fields.Char("Function"), "get_function")


    # Misc Types
    demo_password_field = fields.Char("Password")
    demo_email_field = fields.Char("Email")
    demo_callto_field = fields.Char("Callto")
    demo_url_field = fields.Char("Url")
    demo_sip_field = fields.Char("Sip")


    # With common field attributes
    demo_required_char_field = fields.Char("Required Char", required=True)
    demo_readonly_char_field = fields.Char("Readonly Char", readonly=True)
    demo_translate_char_field = fields.Char("Translate Char", translate=True)

    demo_parent_field = fields.Many2One("demo_fields.target", "Parent")

    def get_function(self, name):
        return "Computed Value"

    @classmethod
    def get_dynamic_selection_options(cls):
        return [
            ("dopt1", "Dynamic Option 1"),
            ("dopt2", "Dynamic Option 2"),
        ]

    @classmethod
    def __setup__(cls):
        super().__setup__()
        
        cls._buttons.update({
                'a_button': {},
                })
                
        cls.__rpc__.update(
            {
                "a_method": RPC(readonly=True, instantiate=0),
            }
        )

    @classmethod
    def a_method(cls, param):
        _logger.info('Method "a_method" is called.')
        return True

    @classmethod
    @ModelView.button
    def a_button(cls, records):
        _logger.info('Method "a_button" is called.')
        return True


class DemoFieldsDict(DictSchemaMixin, ModelSQL, ModelView):
    __name__ = "demo_fields.dict"
