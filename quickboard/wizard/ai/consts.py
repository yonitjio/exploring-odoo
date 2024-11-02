# -*- coding: utf-8 -*-
from autogen import AssistantAgent, UserProxyAgent, filter_config
from textwrap import dedent
from prettytable import PrettyTable

# API_KEY = "_ollama_"
# BASE_URL = "http://localhost:11434/v1"

API_KEY = "_lmstudio_"
BASE_URL = "http://localhost:1234/v1"

LLM_MODEL = "qwen2.5-coder-7b-instruct"

DEFAULT_AUTOGEN_CONFIG_LIST = [
    {
        "model": LLM_MODEL,
        "base_url": BASE_URL,
        "api_key": API_KEY,
    },
]

DEFAULT_AUTOGEN_LLM_CONFIG = {
    "config_list": DEFAULT_AUTOGEN_CONFIG_LIST,
    "cache_seed": None,
    "temperature": 0.3,
    "seed": 10
}

QUICKBOARD_COLORS = [
    "#845ec2",
    "#d65db1",
    "#ff6f91",
    "#ff9671",
    "#ffc75f",
    "#2c73d2",
    "#0081cf",
    "#0089ba",
    "#008e9b",
    "#008f7a",
    "#4b4453",
    "#b0a8b9",
    "#c34a36",
    "#ff8066",
    "#009efa",
    "#3596b5",
    "#9b89b3",
    "#ff8066",
]

QUICKBOARD_DATA_UI_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Generated schema for Root",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string"
            },
            "icon": {
                "type": "string"
            },
            "type": {
                "enum": ["basic", "chart", "list"]
            },
            "model": {
                "type": "string"
            },
            "value_field": {
                "type": "string"
            },
            "aggregate_function": {
                "enum": ["avg", "count", "max", "min", "sum"]
            },
            "text_color": {
                "type": "string"
            },
            "background_color": {
                "type": "string"
            },
            "x_pos": {
                "type": "integer"
            },
            "y_pos": {
                "type": "integer"
            },
            "width": {
                "type": "integer"
            },
            "height": {
                "type": "integer"
            },
            "dimension_field": {
                "type": "string"
            },
            "chart_type": {
                "enum": ["bar", "doughnut", "line", "pie", "polar"]
            },
            "list_row_limit": {
                "type": "integer"
            }
        },
        "allOf": [
            {
                "if": {
                    "properties": {
                        "type": { "const": "chart" }
                    }
                },
                "then": {
                    "required": ["chart_type", "dimension_field"]
                },
                "if": {
                    "properties": {
                        "type": { "const": "list" }
                    }
                },
                "then": {
                    "required": ["list_row_limit"]
                }
            },
        ],
        "required": [
            "name",
            "icon",
            "type",
            "model",
            "value_field",
            "aggregate_function",
            "x_pos",
            "y_pos",
            "width",
            "height"
        ]
    }
}

QUICKBOARD_DATA_ONLY_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Generated schema for Root",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string"
            },
            "icon": {
                "type": "string"
            },
            "type": {
                "enum": ["basic", "chart", "list"]
            },
            "model": {
                "type": "string"
            },
            "value_field": {
                "type": "string"
            },
            "aggregate_function": {
                "enum": ["avg", "count", "max", "min", "sum"]
            },
            "text_color": {
                "type": "string"
            },
            "background_color": {
                "type": "string"
            },
            "dimension_field": {
                "type": "string"
            },
            "chart_type": {
                "enum": ["bar", "doughnut", "line", "pie", "polar"]
            },
            "list_row_limit": {
                "type": "integer"
            }
        },
        "allOf": [
            {
                "if": {
                    "properties": {
                        "type": { "const": "chart" }
                    }
                },
                "then": {
                    "required": ["chart_type", "dimension_field"]
                }
            },
            {
                "if": {
                    "properties": {
                        "type": { "const": "basic" }
                    }
                },
                "then": {
                    "required": ["text_color", "background_color"]
                }
            },
            {
                "if": {
                    "properties": {
                        "type": { "const": "list" }
                    }
                },
                "then": {
                    "required": ["list_row_limit"]
                }
            }
        ],
        "required": [
            "name",
            "icon",
            "type",
            "model",
            "value_field",
            "aggregate_function"
        ]
    }
}

QUICKBOARD_LAYOUT_JSON_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Generated schema for Root",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "id": {
                "type": "integer"
            },
            "type": {
                "enum": ["basic", "chart", "list"]
            },
            "x_pos": {
                "type": "integer"
            },
            "y_pos": {
                "type": "integer"
            },
            "width": {
                "type": "integer"
            },
            "height": {
                "type": "integer"
            }
        },
        "required": [
            "id",
            "type",
            "x_pos",
            "y_pos",
            "width",
            "height"
        ]
    }
}
