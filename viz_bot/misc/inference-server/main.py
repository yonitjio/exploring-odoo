import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

import logging
logger = logging.getLogger("uvicorn")

from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

from phi3vision import Phi3Vision
from llava_next import LlavaNext
from internvl import InternVL

class InferParam(BaseModel):
    model: str
    prompt_text: str
    image_url: HttpUrl

current_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    current_model = None
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "Simple AI Server"}

@app.post("/infer")
def infer(param: InferParam):
    global current_model
    res = ""
    match param.model:
        case "internvl":
            if current_model is None or not isinstance(current_model, InternVL):
                logger.info("Loading InternVL")
                current_model = InternVL()
                current_model.load()
            res = current_model.infer(param.prompt_text, param.image_url)
        case "llavanext":
            if current_model is None or not isinstance(current_model, LlavaNext):
                logger.info("Loading Llava Next")
                current_model = LlavaNext()
                current_model.load()
            res = current_model.infer(param.prompt_text, param.image_url)
        case "phi3vision":
            if current_model is None or not isinstance(current_model, Phi3Vision):
                logger.info("Loading Phi 3 Vision")
                current_model = Phi3Vision()
                current_model.load()
            res = current_model.infer(param.prompt_text, param.image_url)
    return {"result": res}