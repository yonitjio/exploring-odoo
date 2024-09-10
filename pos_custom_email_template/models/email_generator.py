# -*- coding: utf-8 -*-

from textwrap import dedent
from autogen import AssistantAgent, UserProxyAgent
from .agents.consts import DEFAULT_AUTOGEN_LLM_CONFIG

class AiEmailGenerator:
    _SYSTEM_MESSAGE = "You are a helpful AI assistant."

    def __init__(self):
        self._admin: UserProxyAgent = None
        self._email_generator: AssistantAgent = None

    def _create_agents(self):
        admin = UserProxyAgent(
            "admin",
            description="The user who give tasks and questions.",
            human_input_mode="NEVER",
            is_termination_msg=lambda message: True,  # Always True
            code_execution_config=False,
        )

        email_generator = AssistantAgent(
            name="email_generator",
            description=f"AI that generate emails.",
            system_message=dedent(self._SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        return (admin, email_generator)

    def generate_email(self, store_name, customer_name, order_number, tone="formal"):
        self._admin,\
        self._email_generator = self._create_agents()

        message = dedent(f"""
        ### TASK
        Rewrite the following email with more {tone} tone:

        ```
        Dear {customer_name},

        Enclosed herewith, you will find the receipt for your recent transaction bearing order number {order_number} for your convenience and records.

        We are filled with gratitude for your decision to use our products and services. Your support is the driving force behind our commitment
        to excellence, and we are honored to have earned your trust.

        Thank you once again for choosing us. We truly appreciate your business and the opportunity to be of service to you.

        Best Regards,

        {store_name} Team
        ```

        Answer only with the new email content, do not comment.
        """)

        answer = self._admin.initiate_chat(self._email_generator, message=message, silent=True)

        return answer.summary