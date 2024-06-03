import warnings

warnings.filterwarnings(action="ignore", module="transformers")

import logging
_logger = logging.getLogger(__name__)

import re
import json
import urllib.parse
from typing import Any, List

from sqlalchemy import create_engine, inspect
from llama_index.core import SQLDatabase

import odoo
from odoo.tools.misc import file_path

import torch
import guidance
from guidance import models, gen
from guidance import json as gjson

from .schema import assistant_result_json_schema_string

class OdooGuidance:
    TABLE_SALES_ORDER = "sales_order_view"
    TABLE_INVENTORY = "inventory_view"

    def __init__(self, engine):
        self.db = SQLDatabase(engine=engine, view_support=True)
        self.inspector = inspect(engine)

        self.table_names = [self.TABLE_SALES_ORDER, self.TABLE_INVENTORY]
        self.table_defs = {}
        for table in self.table_names:
            columns = []
            clist = self.inspector.get_columns(table)
            for col in clist:
                cdef = f"{col['name']} ({col['type']!s})"
                columns.append(cdef)
            cstr = ", ".join(columns)
            tdef = f'CREATE TABLE {table} ({cstr});'
            self.table_defs[f'{table}'] =  f'{tdef}'

        self.topics = {
            "sales": "Sales inquiry.",
            "inventory": "Inventory inquiry.",
            "general": "General inquiry"
        }

        self.assistant_result_json_schema = json.loads(assistant_result_json_schema_string)

        model_path = file_path(f'ai_bot/models/ai/sqlcoder-7b.Q5_K_M.gguf')
        self.model = models.LlamaCpp(model_path, n_gpu_layers=-1, n_batch=16, n_ctx=4096, verbose=True)
        self.lm = self.model


    @guidance(stateless=True)
    def _query(lm, self, assistant_prompt, q):
        fprompt = assistant_prompt.format(topics=self.topics, query=q)
        lm += fprompt
        lm += gjson(name='answer', json_schema=self.assistant_result_json_schema)
        return lm

    @guidance(stateless=True)
    def _get_sales_data(lm, self, sql_prompt, q):
        fprompt = sql_prompt.format(schema=self.table_defs[self.TABLE_SALES_ORDER], query=q)
        lm += fprompt + gen(name="sql", stop=";", )
        return lm

    @guidance(stateless=True)
    def _get_inventory_data(lm, self, sql_prompt, q):
        fprompt = sql_prompt.format(schema=self.table_defs[self.TABLE_INVENTORY], query=q)
        lm += fprompt + gen(name="sql", stop=";")
        return lm

    @guidance(stateless=True)
    def _synth(lm, self, synth_prompt, q, d):
        fprompt = synth_prompt.format(query=q, res_dict=d)
        lm += fprompt
        lm += gen(name='synth', stop='[/SENTENCE]')
        return lm

    def _format_results(self, results: List[List[Any]], col_keys: List[str]):
        res = []
        for result in results:
            data = dict(zip(col_keys, result))
            res.append(data)
        return res

    def query(self, user_prompt, assistant_prompt, sql_prompt, synth_prompt):
        res = {}
        try:
            self.lm.reset()
            lm = self.lm

            lm += self._query(assistant_prompt, user_prompt)
            answer_json = lm["answer"]
            answer = json.loads(answer_json)

            res["prompt"] = user_prompt
            res["topic"] = answer["topic"]
            res["text"] = answer["text"]

            sql = ""
            match answer["topic"]:
                case "sales":
                    lm += self._get_sales_data(sql_prompt, answer["text"])
                    sql = lm["sql"]
                case "inventory":
                    lm += self._get_inventory_data(sql_prompt, answer["text"])
                    sql = lm["sql"]
                case _:
                    return res

            sql = re.sub(r'(<s>|</s>)', '', sql).strip()
            res["sql"] = sql
            if sql != "" and answer["topic"] in ["sales", "inventory"]:
                _, metadata = self.db.run_sql(sql)
                results = metadata["result"]
                col_keys = metadata["col_keys"]
                res_dict = self._format_results(results, col_keys)
                res["data"] = res_dict

                lm += self._synth(synth_prompt, user_prompt, res_dict)
                synth = lm["synth"]
                synth = re.sub(r'(\[SENTENCE]|\[\/SENTENCE])', '', synth).strip()
                res["synth"] = synth

                return res
        except Exception as e:
            res["error"] =  f'{type(e)}: {e}'
            return res


class OdooAI:
    def __new__(cls, env):
        """ creates a singleton object, if it is not created,
        or else returns the previous singleton object"""
        if not hasattr(cls, '_OdooAI__instance'):
            cls.__instance = super(OdooAI, cls).__new__(cls)
            cls.__instance.__initialized = False
        return cls.__instance

    def __init__(self, env):
        self.env = env

        if(self.__initialized): return
        self.__initialized = True

        db_name = self.env.registry.db_name
        config = odoo.tools.config
        db_url = 'postgresql://'

        if config['db_user']:
            db_url = db_url + config['db_user']

        if config['db_password']:
            db_url = db_url + ':' + urllib.parse.quote_plus(config['db_user'])

        if config['db_host']:
            db_url = db_url + '@' + config['db_host']
        else:
            db_url = db_url + '@localhost'

        if config['db_port']:
            db_url = db_url + ':' + config['db_port']

        db_url = db_url + '/' + db_name

        engine = create_engine(db_url)

        self.ai = OdooGuidance(engine)

    def query(self, prompt):
        assistant_prompt = self.env.company.ai_bot_assistant_prompt
        sql_prompt = self.env.company.ai_bot_sql_prompt
        synth_prompt = self.env.company.ai_bot_synth_prompt

        response = self.ai.query(prompt, assistant_prompt, sql_prompt, synth_prompt)
        return response
