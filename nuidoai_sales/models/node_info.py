# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuidoai.models.node_info import getDefaultInfo, default_post_process

def build_sales_plugin(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def post_process_sales_plugin(plugin, section_role_registry, infos):
    default_post_process(plugin, section_role_registry, infos)
