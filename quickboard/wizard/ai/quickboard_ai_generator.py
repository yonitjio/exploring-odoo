# -*- coding: utf-8 -*-
import json
import copy

from textwrap import dedent
from prettytable import PrettyTable

from autogen import Agent, AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from autogen.coding import MarkdownCodeExtractor

from .consts import DEFAULT_AUTOGEN_LLM_CONFIG, QUICKBOARD_COLORS, QUICKBOARD_DATA_ONLY_JSON_SCHEMA, QUICKBOARD_LAYOUT_JSON_SCHEMA
from .json_validator_agent import UserProxyAgentForJsonValidation

class QuickboardAiGenerator:
    _QUICKBOARD_GENERATOR_SYSTEM_MESSAGE = f"""
        You are an AI assistant specializing in data analysis.
        Your task is to assist user to build an intuitive and informative dashboard.
        You help by creating a list dashboard items base on the fields from the given tables.

        Ignore all your previous knowledge about models, here models are the same with relational database tables.
        Only use the models as mentioned here with common sense, e.g. when the model name is 'sale.order'
        then the model is about sales orders, etc.

        ## DASHBOARD ITEM TYPES
        There are two kind of dashboard items, 'basic', 'list' and 'chart'.
        A 'basic' item is used for single value KPI, 'list' items are usualy used to show top (n) data in a tabular list
        while a 'chart' item is used to show data in a chart.

        Both shared the following common parameters:
            1. name (string): The title of the item. Required.
            2. icon (string): Font awesome version 4.7 icon in 'fa-*' format. Required.
            3. type (string): Dashboard item type. Required.
            4. model (string): model name, e.g. "sale.order", "product.product", etc. Required.
            5. value_field (string): Field of the chosen model for the value to be shown, only accept one field. Required.
            6. aggregate_function (string): Function to be applied on the value field. Required.

        Basic item has the following parameters in addition of the common parameters above:
            1. text_color (string): Text color for the item. Required.
            2. background_color (string): Background color for the item. Required.

        Chart item has the following parameters in addition of the common parameters above:
            1. dimension_field (string): Field of the chosen model for the grouping of the data, only accept one field. Required.
            2. chart_type (string): The chart type. Required.

        List item has the following parameters in addition of the common parameters above:
            1. dimension_field (string): Field of the chosen model for the grouping of the data, only accept one field. Required.
            2. list_row_limit (integer): Number of rows in the list. Required.

        ## COLORS
        Use these color palette for color parameters: {QUICKBOARD_COLORS}

        #EXAMPLE
        Given a model with name 'sale.order' which have the following fields:
        +-------------+------------------------+-----------+-------------------------+-------------------+
        | Model       | Name                   | Type      | Description             | Usage             |
        +-------------+------------------------+-----------+-------------------------+-------------------+
        | ...         | ...                    | ...       | ...                     | ...               |
        | sale.order  | id                     | integer   | ID                      | value, dimension  |
        | sale.order  | date_order             | datetime  | Order Date              | dimension         |
        | sale.order  | medium_id              | integer   | Medium                  | dimension         |
        | sale.order  | sale_order_option_ids  | list      | Optional Products Lines |                   |
        | sale.order  | amount_total           | monetary  | Total                   | value             |
        | sale.order  | amount_to_invoice      | monetary  | Amount to invoice       | value             |
        | ...         | ...                    | ...       | ...                     | ...               |
        +-------------+------------------------+-----------+-------------------------+-------------------+

        And a model with name 'sale.order.line' which have the following fields:
        +------------------+---------------------------+-----------+--------------------------------+-------------------+
        | Model            | Name                      | Type      | Description                    | Usage             |
        +------------------+---------------------------+-----------+--------------------------------+-------------------+
        | ...              | ...                       | ...       | ...                            | ...               |
        | sale.order.line  | product_id                | integer   | Product                        | value, dimension  |
        | sale.order.line  | product_uom_qty           | float     | Quantity                       | value             |
        | sale.order.line  | qty_delivered_method      | char      | Method to update delivered qty | value, dimension  |
        | sale.order.line  | qty_delivered             | float     | Delivery Quantity              | value             |
        | ...              | ...                       | ...       | ...                            | ...               |
        +------------------+---------------------------+-----------+--------------------------------+-------------------+

        You may choose to answer as follow:
        ```json
        [
            {{
                \"name\": \"Sales Order Count\",
                \"icon\": \"fa-shopping-bag\",
                \"type\": \"basic\",
                \"model\": \"sale.order\",
                \"value_field\": \"id\",
                \"aggregate_function\": \"count\",
                \"text_color\": \"#000000\",
                \"background_color\": \"#FFFFFF\"
            }},
            {{
                \"name\": \"Sales Order Total\",
                \"icon\": \"fa-shopping-cart\",
                \"type\": \"basic\",
                \"model\": \"sale.order\",
                \"value_field\": \"amount_total\",
                \"aggregate_function\": \"sum\",
                \"text_color\": \"#000000\",
                \"background_color\": \"#3b3b3b\"
            }},
            {{
                \"name\": \"Total Amount By Date\",
                \"icon\": \"fa-usd\",
                \"type\": \"chart\",
                \"model\": \"sale.order\",
                \"value_field\": \"amount_total\",
                \"aggregate_function\": \"sum\",
                \"dimension_field\": \"date_order\",
                \"datetime_granularity\": \"day\",
                \"chart_type\": \"line\"
            }},
            {{
                \"name\": \"Top 10 Products\",
                \"icon\": \"fa-shopping-bag\",
                \"type\": \"list\",
                \"model\": \"sale.order.line\",
                \"value_field\": \"product_uom_qty\",
                \"aggregate_function\": \"sum\",
                \"dimension_field\": \"product_id\",
                \"list_row_limit\": 10
            }}
        ]
        ```

        ## RULES
        1. Answer only with the definitions of the items in a json list fenced in json code block.
        2. Do not comment. Do not explain your answer.
        3. Do not use models other than the user specifies.
        4. Pay attention to which field belong to which model. Do not to use fields from other models.
        5. Treat each model independently, do not mix fields from one model to another.
        6. All parameters are required, never set any parameter to null.
        7. Set parameter 'type' to 'basic' for basic items, set it to 'list' for list items and set it to 'chart' for chart items.
        8. Parameter 'chart_type' must be one of ['bar', 'doughnut', 'line', 'pie', 'polar'].
        9. Use one of ['avg', 'count', 'max', 'min', 'sum'] for 'aggregate_function' if the 'value_field' is one of ['integer', 'float', 'monetary'].
        10. For other types of 'value_field' such as 'char', 'many2one', etc., the parameter 'aggregate_function' must only be 'count'.
        11. Never use field with type 'date' or 'datetime' for 'value_field'.
        12. Parameter 'value_field' and 'dimension_field', requires exact field name, use the field as is without prefixes nor suffixes.
        13. If the type of 'dimension_field' is date or datetime, you may add 'datetime_granularity' parameter to specify the precision.
            'datetime_granularity' must be one of ["year", "month", "day"].
        14. Do not assume a field has relation to other model, so again, 'value_field' and 'dimension_field' must use the exact name as mentioned here.
        15. Use only single color for color related parameters, not an array of colors, choose one of the colors mentioned above.
        16. Fence your anwser with markdown json code block (```json your_answer ```).
        17. Your answer will be validated by a bot, if your answer is not valid then you must fix it.
        18. When fixing answer re-evaluate everything and do not give comment on the json code block as it will create another error.
        19. When fixing answer always reply with the the fixed json code block with every items.
    """

    def __init__(self, env):
        self.env = env

        self._admin: UserProxyAgent = None
        self._quickboard_ai: AssistantAgent = None
        self._json_validator: UserProxyAgentForJsonValidation = None
        self._groupchat: GroupChat = None
        self._manager: GroupChatManager = None

    def _create_agents(self, data_json_schema):
        admin = UserProxyAgent(
            "admin",
            description="The user who give tasks and questions.",
            human_input_mode="NEVER",
            is_termination_msg=lambda message: True,  # Always True
            code_execution_config=False,
        )

        quickboard_generator = AssistantAgent(
            name="quickboard_generator",
            description=f"AI that generate dashboards.",
            system_message=dedent(self._QUICKBOARD_GENERATOR_SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        data_json_validator = UserProxyAgentForJsonValidation(
            "data_json_validator",
            json_schema=data_json_schema,
            description="An bot that performs no other action than validating json (provided to it's quoted in json blocks).",
            human_input_mode="NEVER",
        )

        def _speaker_selection_func(last_speaker: Agent, groupchat: GroupChat):
            last_messages = groupchat.messages[-1]
            next_speaker = admin

            if last_speaker is admin:
                next_speaker = quickboard_generator
            elif last_speaker is quickboard_generator:
                next_speaker = data_json_validator
            elif last_speaker is data_json_validator:
                # if last agent reply with invalid json then let it try again
                if last_messages["content"].find("exitcode: -1") > -1:
                    next_speaker = quickboard_generator
                elif last_messages["content"].strip() == "":
                    next_speaker = quickboard_generator

            return next_speaker

        groupchat = GroupChat(
            agents=[admin, quickboard_generator, data_json_validator],
            messages=[],
            max_round=5,
            speaker_selection_method= _speaker_selection_func,
            # send_introductions=True,
        )

        manager = GroupChatManager(
            groupchat=groupchat,
            name="chat_manager",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG
        )

        return (admin, quickboard_generator, data_json_validator, manager, groupchat)

    def _build_agent_parameters(self, models):
        model_names = []
        model_infos = []

        data_json_schema = copy.deepcopy(QUICKBOARD_DATA_ONLY_JSON_SCHEMA)

        for model in models:
            field_defs = PrettyTable()
            field_defs.align = "l"
            field_defs.field_names = ["Model", "Name", "Type", "Description", "Usage"]

            fields = self.env[model.model].fields_get()

            valid_value_fields = []
            valid_dimension_fields = []

            for k, v in fields.items():
                if v["store"]:

                    if v["type"] in ["many2many", "one2many"]:
                        field_type = "list"
                    elif v["type"] == "selection":
                        field_type = "char"
                    elif v["type"] == "many2one":
                        field_type = "integer"
                    else:
                        field_type = v["type"]

                    usage = []
                    if v["type"] not in ["many2many", "one2many", "float", "monetary"]:
                        valid_dimension_fields.append(f"{k}")
                        usage.append("dimension")

                    if v["type"] in ["integer", "float", "monetary", "many2one", "selection"]:
                        valid_value_fields.append(f"{k}")
                        usage.append("value")

                    field_defs.add_row([model.model, f"{k}", field_type, v['string'], ",".join(usage)])

            valid_value_fields_str = ", ".join([f"'{o}'" for o in valid_value_fields])
            valid_dimension_fields_str = ", ".join([f"'{o}'" for o in valid_dimension_fields])

            model_names.append(model.model)
            model_infos.append({
                "name": model.model,
                "field_defs": field_defs.get_string(),
                "value_fields": valid_value_fields_str,
                "dimension_fields": valid_dimension_fields_str
            })

            model_name_schema = {
                "const": model.model
            }

            value_field_schema = {
                "if": {
                        "properties": {
                            "model": model_name_schema
                        }
                    },
                    "then": {
                        "properties": {
                            "value_field": {
                                "enum": valid_value_fields
                            }
                        }
                    }
                }
            dimension_field_schema  = {
                "if": {
                        "properties": {
                            "model": model_name_schema
                        }
                    },
                    "then": {
                        "properties": {
                            "dimension_field": {
                                "enum": valid_dimension_fields
                            }
                        }
                    }
                }

            data_json_schema["items"]["model"] = model_name_schema
            data_json_schema["items"]["allOf"].append(value_field_schema)
            data_json_schema["items"]["allOf"].append(dimension_field_schema)

        return model_names, model_infos, data_json_schema

    def _create_message(self, model_names, model_infos):
        message = dedent(f"""
                Create dashboard items from these models {[o for o in model_names]}.
            """)

        for mi in model_infos:
            mi_string = dedent(f"""
                ### MODEL '{mi["name"]}'
                The model '{mi["name"]}' has the following fields:
                {mi["field_defs"]}
            """)

            message = message + "\n" + mi_string


        message += dedent("""
            Pay attention to the field usage. Valid values for 'value_field' and 'dimension_field' are based on it.

            Also pay attention to which model a field belongs to, do not use other models field in a dashboard item.
            Always use the exact field name as mentioned above on the models field.

            Create at least 3 'basic' items, 3 'list' items and 3 'chart' items.
            Make the 'basic' items background colorful with matching but still readable text color.
            Answer only in a json list fenced in a json code block.
        """)

        return message

    def _arrange_items(self, quickboard_items):
        items = copy.deepcopy(quickboard_items)
        basic_items = [o for o in items if o["type"] == "basic"]
        list_chart_items = [o for o in items if o["type"] != "basic"]

        fin = []
        row = 0
        while len(basic_items) > 0:
            count = 1
            width = 6
            if len(basic_items) >= 6:
                count = 6
                width = 2
            elif len(basic_items) >= 4:
                count = 4
                width = 3
            elif len(basic_items) >= 3:
                count = 3
                width = 4
            elif len(basic_items) >= 2:
                count = 2
                width = 6

            row_items = basic_items[:count]
            for k, o in enumerate(row_items):
                o["y_pos"] = row
                o["x_pos"] = k * width
                o["height"] = 1
                o["width"] = width

            fin.extend(row_items)
            del basic_items[:count]

            row += 1

        while len(list_chart_items) > 0:
            width = 4
            count = 3

            if len(list_chart_items) >= 4:
                count = 4
                width = 3
            elif len(list_chart_items) >= 3:
                count = 3
                width = 4
            elif len(list_chart_items) >= 2:
                count = 2
                width = 6

            row_items = list_chart_items[:count]
            for k, o in enumerate(row_items):
                o["y_pos"] = row
                o["x_pos"] = k * width
                o["height"] = 2
                o["width"] = width

            fin.extend(row_items)
            del list_chart_items[:count]

            row += 2

        return fin

    def generate_quickboard(self, models, layout_by_ai, screen_w, screen_h, cell_w, cell_h):
        model_names, model_infos, json_schema = self._build_agent_parameters(models)

        self._admin,\
        self._quickboard_ai,\
        self._json_validator,\
        self._manager,\
        self._groupchat = self._create_agents(json_schema)

        message = self._create_message(model_names, model_infos)
        answer = self._admin.initiate_chat(self._manager, message=message) #, silent=True)

        res = ""

        # The json is not on answer.summary / last message since the last agent is json validator when successful
        if answer.summary.find("exitcode: 0") > -1:
            extractor = MarkdownCodeExtractor()
            code_blocks = extractor.extract_code_blocks(answer.chat_history[-2]["content"])
            if len(code_blocks) > 0:
                quickboard = code_blocks[0].code
                quickboard_items = json.loads(quickboard)

                arranged_items = []
                if layout_by_ai:
                    aiDesigner = QuickboardAIDesigner()
                    arranged_items = aiDesigner.arrange_items_with_ai(quickboard_items, screen_w, screen_h, cell_w, cell_h)
                else:
                    arranged_items = self._arrange_items(quickboard_items)

                res = json.dumps(arranged_items)

        return res

class QuickboardAIDesigner:
    _QUICKBOARD_DESIGNER_SYSTEM_MESSAGE = f"""
        Your task is to design the layout of a dashboard from the given dashboard items.

        ## DASHBOARD ITEM TYPES
        There are three kind of dashboard items, basic, list and chart.
        A basic item is used for single value KPI, a list is used to display data in a tabular list
        while a chart item is used to show data in a graphical chart.

        All have the following attribute:
        1. id: The id of the dashboard item.
        2. type: Dashboard item type, 'basic' for basic items, 'list' for list items and 'chart' for chart items.
        3. x_pos: The horizontal position on the grid (0 to 11, representing the block's position).
        4. y_pos: The vertical position on the grid (measured in blocks, can be unlimited).
        5. width: The width of the item.
        6. height: The height of the item.

        ## LAYOUT
        The dashboard layout is a grid system measured in square blocks.

        It has 12 blocks for column width and unlimited cell rows.
        The origin (0, 0) position is on the top left. The maximum position of the top row is (12, 0).

        ## REQUIREMENTS
        1. Prioritize the arrangement of blocks to optimize space, i,e. no gaps between items.
        2. Ensure that no blocks overlap and that all blocks are positioned within the defined grid limits.
        3. Arrange the 'basic' items to fill the top rows.
        4. Arrange the rest of the items to fill the rows after the 'basic' items.

        ## RULES
        1. Do not change the 'id' and the 'type' of the dashboard items,
           i.e, the 'id' and 'type' is a fixed pair. If you want to re-arrange the items, always use the same 'id' and 'type' pair.
        2. Only edit these attribute 'x_pos', 'y_pos', 'width', 'height'.
        3. Do not add nor remove dashboard items!
        4. Fence your anwser with markdown json block.
        5. Do not comment. Do not explain your answer.
        6. Your answer will be validated by a bot, if your answer is not valid then you must fix it.
        7. When fixing answer re-evaluate everything and do not give comment as it will create another error.
        8. When fixing answer always reply with the the fixed json code block with every items.
    """

    def __init__(self):
        self._admin: UserProxyAgent = None
        self._quickboard_ai: AssistantAgent = None
        self._json_validator: UserProxyAgentForJsonValidation = None
        self._groupchat: GroupChat = None
        self._manager: GroupChatManager = None

    def _create_agents(self, ui_json_schema):
        admin = UserProxyAgent(
            "admin",
            description="The user who give tasks and questions.",
            human_input_mode="NEVER",
            is_termination_msg=lambda message: True,  # Always True
            code_execution_config=False,
        )

        quickboard_designer = AssistantAgent(
            name="quickboard_designer",
            description=f"AI that design the layout of dashboards.",
            system_message=dedent(self._QUICKBOARD_DESIGNER_SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        ui_json_validator = UserProxyAgentForJsonValidation(
            "ui_json_validator",
            json_schema=ui_json_schema,
            description="An bot that performs no other action than validating json (provided to it's quoted in json blocks).",
            human_input_mode="NEVER",
        )

        def _speaker_selection_func(last_speaker: Agent, groupchat: GroupChat):
            last_messages = groupchat.messages[-1]
            next_speaker = admin

            if last_speaker is admin:
                next_speaker = quickboard_designer
            elif last_speaker is quickboard_designer:
                next_speaker = ui_json_validator
            elif last_speaker is ui_json_validator:
                # if last agent reply with invalid json then let it try again
                if last_messages["content"].find("exitcode: -1") > -1:
                    next_speaker = quickboard_designer
                elif last_messages["content"].strip() == "":
                    next_speaker = quickboard_designer

            return next_speaker

        groupchat = GroupChat(
            agents=[admin, quickboard_designer, ui_json_validator],
            messages=[],
            max_round=5,
            speaker_selection_method= _speaker_selection_func,
            # send_introductions=True,
        )

        manager = GroupChatManager(
            groupchat=groupchat,
            name="chat_manager",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG
        )

        return (admin, quickboard_designer, ui_json_validator, manager, groupchat)

    def _build_agent_parameters(self, quickboard_items):
        layout_json_schema = copy.deepcopy(QUICKBOARD_LAYOUT_JSON_SCHEMA)

        item_count = len(quickboard_items)
        item_count_schema  = {
                "minItems": item_count,
                "maxItems": item_count
            }

        layout_json_schema.update(item_count_schema)

        item_id_type_schema = []
        for item in quickboard_items:
            id_type_schema = {
                "if": {
                        "properties": {
                            "id": { "const": item["id"] }
                        }
                    },
                    "then": {
                        "properties": {
                            "type": { "const": item["type"] }
                        }
                    }
                }
            item_id_type_schema.append(id_type_schema)

        layout_json_schema["items"]["allOf"] = item_id_type_schema

        return layout_json_schema

    def _create_message(self, quickboard_items, screen_w, screen_h, cell_w, cell_h):
        layout_items = [[{
                "id": o["id"],
                "type": o["type"],
                "x_pos": 0,
                "y_pos": 0,
                "width": 0,
                "height": 0
            }] for o in quickboard_items]

        layout_items_count = len(layout_items)
        layout_items_str = ", ".join([ f"{json.dumps(o)}\n" for o in layout_items])

        message = f"""
            Design dashboard layout for these {layout_items_count} items: {layout_items_str}.

            The cell size for my screen is {cell_w} x {cell_h} (width x height).
            My screen size is {screen_w} x {screen_h} (width x height).

            Make it compact, for 'basic' items 1 block for its height is enough.
            For 'list' and 'chart' items 3 blocks for its height are enough.

            Put basic items first then list and chart items.
            Do not change the 'id' and the 'type' of the items.
            Remember there are {layout_items_count}, use them all, do not add any item nor remove any of them.
        """
        return message

    def arrange_items_with_ai(self, quickboard_items, screen_w, screen_h, cell_w, cell_h):
        res = quickboard_items
        for i, item in enumerate(quickboard_items, start=1):
            item["id"] = i

        json_schema = self._build_agent_parameters(quickboard_items)

        self._admin,\
        self._quickboard_ai,\
        self._json_validator,\
        self._manager,\
        self._groupchat = self._create_agents(json_schema)

        message = self._create_message(quickboard_items, screen_w, screen_h, cell_w, cell_h)
        answer = self._admin.initiate_chat(self._manager, message=message) #, silent=True)

        if answer.summary.find("exitcode: 0") > -1:
            extractor = MarkdownCodeExtractor()
            code_blocks = extractor.extract_code_blocks(answer.chat_history[-2]["content"])
            if len(code_blocks) > 0:
                layout = code_blocks[0].code
                layout_items = json.loads(layout)

            # merge item and layout
            fin_items = []
            for item in quickboard_items:
                for layout in layout_items:
                    if layout["id"] == item["id"] and layout["type"] == item["type"]:
                        item.update(layout)
                        break

                fin_items.append(item)

            return fin_items

        return res
