# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

def getSectionValues(node, edges):
    if "sections" in node:
        res = {}
        sections = node["sections"]
        for section in sections:
            role = section["role"]
            value = section["value"] if "value" in section else None
            direction = section["direction"]
            if direction == "none" and value:
                res.update({
                    role: value
                })
            elif direction == "in" or direction == "inout":
                incomingEdges = [e for e in edges if e["inPortId"] == section["inPortId"]]
                for edge in incomingEdges:
                    inPort  = next((ip for ip in node["inPorts"] if ip["id"] == edge["inPortId"]), None)
                    if inPort and inPort["maxLinks"] > 1:
                        if role in res:
                            res[role].append(edge["outNodeId"])
                        else:
                            res.update({
                                role: [edge["outNodeId"]]
                            })
                    elif inPort and inPort["maxLinks"] == 1:
                        res.update({
                            role: edge["outNodeId"]
                        })

        return res
    else:
        return False

def getBasicInfo(node):
    node_type = node["nodeType"]
    info = {
        "id": node["id"],
        "type": node_type[:-4] if node_type.endswith("Node") else node_type
    }

    return info

def getDefaultInfo(node, edges):
    sectionValues = getSectionValues(node, edges)

    info = getBasicInfo(node)
    if (sectionValues):
        info.update(sectionValues)

    return info

def get_related_object(type, id, infos):
    obj = next((info for info in infos if info["id"] == id), None)
    return obj

def default_post_process(object, section_role_registry, infos):
    for o in object:
        section_rec = next((r for r in section_role_registry if r["key"] == o), None)
        if section_rec:
            section_info = section_rec["value"].split(",")
            section_type = section_info[0]
            if section_type == "object":
                section_sub_type = section_info[1]
                id = object[o]
                obj = get_related_object(section_sub_type, id, infos)

                if obj:
                    object[o] = obj
                else:
                    raise Exception(f"Section role not found: {o}")
            if section_type == "array":
                section_sub_type = section_info[1]
                ids = object[o]
                objs = []

                for id in ids:
                    obj = get_related_object(section_sub_type, id, infos)
                    if obj:
                        objs.append(obj)
                    else:
                        raise Exception(f"Section role not found: {o}")

                object[o] = objs

def post_process_default(agent, section_role_registry, infos):
    default_post_process(agent, section_role_registry, infos)

def build_open_ai_chat_completion_service(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_chat_group(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_chat_completion_agent(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_math_plugin(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_date_plugin(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_random_number_plugin(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_prompt_selection_strategy(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_sequential_selection(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def build_prompt_termination_strategy(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def post_process_chat_completion_agent(agent, section_role_registry, infos):
    default_post_process(agent, section_role_registry, infos)

def post_process_chat_group(group, section_role_registry, infos):
    default_post_process(group, section_role_registry, infos)

def post_process_open_ai_chat_completion_service(service, section_role_registry, infos):
    default_post_process(service, section_role_registry, infos)

def post_process_date_plugin(plugin, section_role_registry, infos):
    default_post_process(plugin, section_role_registry, infos)

def post_process_math_plugin(plugin, section_role_registry, infos):
    default_post_process(plugin, section_role_registry, infos)

def post_process_random_number_plugin(plugin, section_role_registry, infos):
    default_post_process(plugin, section_role_registry, infos)

def post_process_prompt_selection_strategy(strategy, section_role_registry, infos):
    default_post_process(strategy, section_role_registry, infos)

def post_process_sequential_selection(selection, section_role_registry, infos):
    default_post_process(selection, section_role_registry, infos)

def post_process_prompt_termination_strategy(strategy, section_role_registry, infos):
    default_post_process(strategy, section_role_registry, infos)
