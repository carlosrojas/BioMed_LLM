import os, json, glob, numpy as np
from sentence_transformers import SentenceTransformer

MODEL = None
def _model():
    global MODEL
    if MODEL is None:
        MODEL = SentenceTransformer("intfloat/e5-base")
    return MODEL

def build_index(data_dir: str, out_path: str):
    files = glob.glob(os.path.join(data_dir, "*.md"))
    docs = []
    for fp in files:
        with open(fp, "r", encoding="utf-8") as f:
            txt = f.read().strip()
        docs.append({"id": os.path.basename(fp), "text": txt})
    model = _model()
    emb = model.encode([d["text"] for d in docs], normalize_embeddings=True)
    np.save(out_path + ".npy", emb)
    with open(out_path + ".json", "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    build_index("healthmate/data/guidelines", "healthmate/retriever/guidelines_index")
