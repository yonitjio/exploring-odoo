# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.


def build_dict_map(items):
    children_map = {}
    for item in items:
        parent_id = item.get('parent_id') or None
        children_map.setdefault(parent_id, []).append(item)

    def build_subtree(parent_id):
        subtree = {}
        for child in children_map.get(parent_id, []):
            if child['id'] in children_map:
                subtree[child['name']] = build_subtree(child['id'])
            else:
                subtree[child['name']] = child.get('value')
        return subtree

    res = build_subtree(None)

    return res

def get_nested_value(source, path):
    if isinstance(path, str):
        path = path.split(".")

    for key in path:
        if isinstance(source, dict):
            source = source.get(key)
        elif isinstance(source, (list, tuple)):
            try:
                key = int(key)  # Convert to integer for list indexing
                source = source[key]
            except (ValueError, IndexError):
                return None
        else:
            return None
    return source


def map_nested_dict(source, mapping):
    def recurse(mapping_node):
        if isinstance(mapping_node, dict):
            return {k: recurse(v) for k, v in mapping_node.items()}
        elif isinstance(mapping_node, (str, list)):
            return get_nested_value(source, mapping_node)
        else:
            raise ValueError(f"Unsupported mapping value type: {type(mapping_node)}")

    return recurse(mapping)