import spacy
from negspacy.negation import Negex

# Use scispaCy drug/disease model you installed: en_ner_bc5cdr_md
NLP_MODEL = "en_ner_bc5cdr_md"

_nlp = spacy.load(NLP_MODEL)
_nlp.add_pipe("negex", last=True)

def parse_clinical(text: str):
    doc = _nlp(text)
    ents = []
    for e in doc.ents:
        ents.append({
            "text": e.text, "label": e.label_,
            "negated": bool(getattr(e._, "negex", False)),
            "sent": e.sent.text
        })
    return ents
