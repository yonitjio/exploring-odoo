from trytond.pool import Pool

from .demo_fields import (
    DemoFields,
    DemoFieldsRelation,
    DemoFieldsChild,
    DemoFieldsAnotherChild,
    DemoFieldsTarget,
    DemoFieldsSource,
    DemoFieldsDict
)


def register():
    Pool.register(
        DemoFields,
        DemoFieldsRelation,
        DemoFieldsChild,
        DemoFieldsAnotherChild,
        DemoFieldsTarget,
        DemoFieldsSource,
        DemoFieldsDict,
        module="demo_fields",
        type_="model",
    )
