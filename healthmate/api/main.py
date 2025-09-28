from fastapi import FastAPI
from pydantic import BaseModel
from healthmate.nlp.pipeline import parse_clinical
from healthmate.nlp.meds import extract_medications
from healthmate.retriever.search import hybrid_search
from healthmate.llm.rag import answer_with_context
from healthmate.api.safety import safety_gate

app = FastAPI(title="HealthMate MVP")

class Query(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/extract")
def extract(q: Query):
    return {"entities": parse_clinical(q.text), "medications": extract_medications(q.text)}

@app.post("/chat")
def chat(q: Query):
    hits = hybrid_search(q.text, k=3)
    ans  = answer_with_context(q.text, hits)
    gated = safety_gate(q.text, ans, hits)
    return {"retrieved": hits, **gated}
