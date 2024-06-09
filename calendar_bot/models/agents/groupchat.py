# -*- coding: utf-8 -*-
import copy

from typing import Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass

from autogen import Agent, GroupChat, GroupChatManager

@dataclass
class GroupChatWithMessageCallback(GroupChat):
    on_append_message: Optional[Callable] = None

    def append(self, message: Dict, speaker: Agent):
        super().append(message, speaker)
        if self.on_append_message is not None:
            self.on_append_message(message, speaker)

class ResumingGroupChatManager(GroupChatManager):
    def __init__(self, groupchat: GroupChat,
                 history: Optional[List[Dict]] = None,
                 on_history_restored: Optional[Callable] = None, **kwargs):
        self._on_history_restored = on_history_restored
        super().__init__(groupchat, **kwargs)
        self.register_reply(Agent, ResumingGroupChatManager.restore_history, config=history)

    def restore_history(self,
                        messages: Optional[List[Dict]] = None,
                        sender: Optional[Agent] = None,
                        config: Optional[list] = None, **kwargs) -> Tuple[bool, Optional[str]]:
        if config:
            histories = config
            if len(histories) > 0:
                fmsg = copy.copy(messages)

                self._oai_messages[sender].clear()
                sender._oai_messages[self].clear()

                for func in self._reply_func_list:
                    if "config" in func and isinstance(func["config"], GroupChat):
                        cfg = func["config"]
                        setattr(cfg, "send_introductions", False)

                for history in histories:
                    speaker_name = history.get("name", self.groupchat.admin_name)
                    if speaker_name is None:
                        raise ValueError("Speaker name is missing in the message and no admin name is set in the group chat")
                    speaker = self.groupchat.agent_by_name(name=speaker_name)
                    if speaker is None:
                        raise ValueError(f"Speaker {speaker_name} not found in the group chat")

                    self.groupchat.append(history, speaker)

                    #TODO: Introduction message ???
                    for agent in self.groupchat.agents:
                        if agent == speaker:
                            self._append_oai_message(history, "user", agent) # from chat manager perspective speaker is user
                            agent._append_oai_message(history, "assistant", self) # from agent perspective itself is an assistant
                        else:
                            self._append_oai_message(history, "assistant", agent)
                            agent._append_oai_message(history, "user", self)

                for msg in fmsg:
                    self._append_oai_message(msg, "user", sender)
                    sender._append_oai_message(msg, "assistant", self)

        if self._on_history_restored is not None:
            self._on_history_restored()
        return False, None

