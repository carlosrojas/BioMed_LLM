import textwrap
from healthmate.llm.ollama_generate import generate_with_ollama


def build_prompt(user_text: str, hits):
    ctx = "\n\n".join([f"[{h['id']}]\n{h['text']}" for h in hits])
    return f"""You are HealthMate, a careful health information assistant.
Use only the sources below. If unsure, say so and suggest seeing a clinician. Be friendly but concise.
User: {user_text}

Sources:
{ctx}

Answer (don't cite source files):"""


def answer_with_context(user_text: str, hits):
    prompt = build_prompt(user_text, hits)
    result = generate_with_ollama(prompt, "", include_prompt=True)
    return {
        "answer": result["output"],
        "model": result["model"],
        "system_prompt": prompt,
        "final_prompt": result["prompt"],
    }


def rag_answer(question, retriever):
    # 1. Retrieve relevant context
    context = retriever.retrieve(
        question
    )  # This should return a string of relevant docs/snippets

    # 2. Generate answer using Ollama
    answer = generate_with_ollama(context, question)
    return answer
