import json, numpy as np
from sentence_transformers import SentenceTransformer

MODEL = None
DOCS, EMB = None, None

def _model():
    global MODEL
    if MODEL is None:
        MODEL = SentenceTransformer("intfloat/e5-base")
    return MODEL

def load_index(base_path: str):
    global DOCS, EMB
    with open(base_path + ".json", "r", encoding="utf-8") as f:
        DOCS = json.load(f)
    EMB = np.load(base_path + ".npy")

def hybrid_search(query: str, k: int = 3):
    if DOCS is None or EMB is None:
        load_index("healthmate/retriever/guidelines_index")
    q_emb = _model().encode([query], normalize_embeddings=True)[0]
    scores = (EMB @ q_emb)  # cosine since normalized
    top = scores.argsort()[-k:][::-1]
    return [{"id": DOCS[i]["id"], "text": DOCS[i]["text"], "score": float(scores[i])} for i in top]
