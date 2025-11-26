import textwrap
from healthmate.llm.ollama_generate import generate_with_ollama


def build_context(hits):
    """Build formatted context from retrieved documents."""
    if not hits:
        return "No relevant medical guidelines found."
    
    context_parts = []
    for i, hit in enumerate(hits, 1):
        source_id = hit.get('id', f'source_{i}')
        source_text = hit.get('text', '')
        score = hit.get('score', 0.0)
        context_parts.append(f"[Source {i}: {source_id}]\n{source_text}")
    
    return "\n\n".join(context_parts)


def answer_with_context(user_text: str, hits, model: str = "llama3.1:8b"):
    """
    Generate an answer using RAG with retrieved context.
    
    Args:
        user_text: The user's question or input
        hits: List of retrieved documents with 'id', 'text', and optionally 'score'
        model: The Ollama model to use (default: llama3.1:8b)
    
    Returns:
        Dictionary with answer, model, system_prompt, and final_prompt
    """
    # Build context from retrieved documents
    context = build_context(hits)
    
    # Create a system instruction that will be part of the context
    system_instruction = """You are HealthMate, a careful and helpful health information assistant. 
Your role is to provide accurate, evidence-based health information using ONLY the medical guidelines provided in the context below.

IMPORTANT GUIDELINES:
- Base your answer ONLY on the provided medical sources
- If the sources don't contain relevant information, clearly state that you cannot answer based on available sources
- Always recommend consulting a healthcare provider for personalized medical advice
- Be friendly, concise, and clear
- If you identify urgent symptoms (chest pain, severe difficulty breathing, etc.), emphasize immediate medical attention
- Do NOT cite source file names in your answer, but use the information from them

Now, use the following medical guidelines to answer the user's question:"""
    
    # Combine system instruction with retrieved context
    full_context = f"{system_instruction}\n\n{context}"
    
    # Generate answer using Ollama
    result = generate_with_ollama(
        context=full_context,
        question=user_text,
        model=model,
        include_prompt=True
    )
    
    return {
        "answer": result["output"],
        "model": result["model"],
        "system_prompt": system_instruction,
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
