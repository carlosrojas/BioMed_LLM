import requests


def generate_with_ollama(
    context: str,
    question: str,
    model: str = "llama3.1:8b",
    include_prompt: bool = False,
):
    prompt = f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
    )
    response.raise_for_status()
    data = response.json()
    output = data.get("response", "")
    if include_prompt:
        return {"output": output, "prompt": prompt, "model": model}
    return output
