from fastapi import FastAPI
from sentence_transformers import SentenceTransformer, util
from pydantic import BaseModel

app = FastAPI()

model = SentenceTransformer('./all-MiniLM-L6-v2/')

class StringData(BaseModel):
    sourceStr: str
    targetStr: list[str]


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.post("/compare/")
async def compare(data: StringData):
    sourceStr = data.sourceStr
    targetStr = data.targetStr

    return Compare(sourceStr, targetStr)

def Compare(sourceStr, targetStrs):
    sourceEmb = model.encode(sourceStr, convert_to_tensor=True)
    targetEmbs = model.encode(targetStrs, convert_to_tensor=True)
    cosine_scores = []

    for targetEmb in targetEmbs:
        cosine_scores.append(util.cos_sim(sourceEmb, targetEmb)[0][0].item())

    print(cosine_scores)
    return {"cosine_scores": cosine_scores}
