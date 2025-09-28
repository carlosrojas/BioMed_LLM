import re

RED_FLAGS = [
    r"(chest pain|pressure in (the )?chest).*(short(ness)? of breath|sweating|nausea)",
    r"(worst|thunderclap) headache",
    r"(face droop|arm weakness|speech trouble)",
    r"(anaphylaxis|throat closing|hives.*breath)"
]
ADVICE = "This may be urgent. Call emergency services or go to the nearest ER now."

def matches_red_flag(text: str) -> bool:
    t = text.lower()
    return any(re.search(p, t) for p in RED_FLAGS)

def safety_gate(user_text: str, llm_answer: str, retrieved):
    if matches_red_flag(user_text):
        return {"status":"urgent", "message": ADVICE}
    if not retrieved:
        return {"status":"abstain", "message":"I can’t answer safely without a source. Consider seeing a clinician."}
    return {"status":"ok", "message": llm_answer}
