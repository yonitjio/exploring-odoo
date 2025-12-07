# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

from ..ai.chitchat import ChitChat
from ..ai.streamer import Streamer

class NuidoAiController(http.Controller):
    @http.route('/nuidoai/chat', type='json', auth='user', website=True)
    def chat(self, channel, message, history):
        env = request.env

        node_definition = env.company.node_definition
        node_definition_def = node_definition["definition"]

        chitchat = ChitChat(env, node_definition_def)
        if chitchat.mode != "None":
            streamer = Streamer(env)

            if chitchat.mode == "group":
                res = streamer.group_chat(chitchat, channel, message)
            else:
                res = streamer.agent_chat(chitchat, channel, message, history)
            return res
        else:
            return False

    @http.route('/nuidoai/chat/test', type='json', auth='user', website=True)
    def test_chat(self, agent_def_id, channel, message, history):
        env = request.env

        node_definition = env["nuidoai.node.definition"].browse(agent_def_id)
        _, node_definition_def = node_definition.process_node_definition(node_definition["raw"])

        chitchat = ChitChat(env, node_definition_def)
        if chitchat.mode != "None":
            streamer = Streamer(env)

            if chitchat.mode == "group":
                res = streamer.group_chat(chitchat, channel, message)
            else:
                res = streamer.agent_chat(chitchat, channel, message, history)
            return res
        else:
            return False
