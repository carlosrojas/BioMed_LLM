import textwrap

def build_prompt(user_text: str, hits):
    ctx = "\n\n".join([f"[{h['id']}]\n{h['text']}" for h in hits])
    return f"""You are a careful health information assistant.
Use only the sources below. If unsure, say so and suggest seeing a clinician.
User: {user_text}

Sources:
{ctx}

Answer (cite sources by [filename]):"""

def answer_with_context(user_text: str, hits):
    # Stub: pick sentences from top hit and add a safety reminder.
    prompt = build_prompt(user_text, hits)
    top = hits[0]["text"] if hits else ""
    summary = "\n".join(line for line in top.splitlines()[:3])
    cites = ", ".join(f"[{h['id']}]" for h in hits[:2])
    return textwrap.dedent(f"""{summary}

This is general information, not a diagnosis. If red flags are present, seek urgent care. {cites}""").strip()
