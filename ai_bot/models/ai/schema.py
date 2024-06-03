assistant_result_json_schema_string = \
"""
{
    "type": "object",
    "properties": {
        "topic": { "type": "string", "enum": ["sales", "inventory", "general"] },
        "text": { "type": "string" }
    }
}
"""