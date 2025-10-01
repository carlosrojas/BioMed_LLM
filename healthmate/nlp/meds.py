import re, spacy
from negspacy.negation import Negex

RX_DOSE = re.compile(r"\b(\d+(?:\.\d+)?)(\s?(?:mg|mcg|g|ml|units))\b", re.I)
RX_FREQ = re.compile(r"\b(once|twice|every\s?\d+\s?(?:h|hr|hour|hours|day|days)|\d+x\/day|bid|tid|qid|q\d+h)\b", re.I)
RX_ROUTE = re.compile(r"\b(oral|po|by mouth|iv|intravenous|im|subcutaneous|sc|topical|inhal(ed|ation)?)\b", re.I)
RX_FORM  = re.compile(r"\b(tablet|tab|capsule|cap|syrup|solution|suspension|cream|ointment|patch|inhaler)\b", re.I)

_nlp = spacy.load("en_core_web_sm")
_nlp.add_pipe("negex", last=True)

def extract_medications(text: str):
    doc = _nlp(text)
    meds, seen = [], set()
    for ent in doc.ents:
        if ent.label_.upper() == "CHEMICAL":
            sent = ent.sent.text
            item = {
                "drug": ent.text,
                "negated": bool(getattr(ent._, "negex", False)),
                "dose": _m(RX_DOSE, sent),
                "frequency": _m(RX_FREQ, sent),
                "route": _m(RX_ROUTE, sent),
                "form": _m(RX_FORM, sent),
                "context": sent.strip()
            }
            key = (item["drug"].lower(), item["dose"], item["frequency"], item["route"], item["form"], item["negated"])
            if key not in seen:
                seen.add(key); meds.append(item)
    return meds

def _m(rx, s): 
    m = rx.search(s); return m.group(0) if m else None
