import requests

def generate_with_ollama(context: str, question: str, model: str = "llama3:8b") -> str:
    prompt = f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False}  # <--- add "stream": False
    )
    response.raise_for_status()
    return response.json()["response"]
