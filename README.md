# HealthMate

## Overall Objective

Clinical question answering and information extraction using Retrieval-Augmented Generation (RAG) with a local Llama 3.1 8B model, contextual retrieval, and entity/medication extraction.

## High-level Approach

- **Retrieval-Augmented Generation (RAG):** Uses local Llama 3.1 8B via Ollama for answer generation.
- **Contextual Retrieval:** Embeddings and similarity search over clinical guidelines.
- **Medication & Entity Extraction:** Uses spaCy (`en_core_web_sm`) and Negex for general NER and negation detection.
- **FastAPI API:** Endpoints for health check, extraction, and chat.

## Setup

### 1. Clone the repo and enter the directory

```bash
git clone <your-repo-url>
cd BioMed_LLM
```

### 2. Create and activate a Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 4. Install and run Ollama (for Llama 3.1 8B)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama3.1:8b
```

## Running the API

From your project root:

```bash
uvicorn healthmate.api.main:app --reload
```

- The API will be available at [http://127.0.0.1:8000]

## Endpoints

- `GET /health` — Health check
- `POST /extract` — Extracts entities and medications from text
- `POST /chat` — Retrieval-augmented chat using Llama 3.1 8B via Ollama
- `POST /auth/signup` - Sign up new user
- `POST /auth/login` - Login
- `GET /user/profile` - Get user profile

## Notes

- **No Hugging Face authentication is required** for this setup.
- Make sure Ollama is running and the model is pulled before using `/chat`.

## Troubleshooting

- If you see `ModuleNotFoundError: No module named 'healthmate'`, make sure you run `uvicorn` from the project root and set `PYTHONPATH=.` if needed.
- If you see errors about missing spaCy models, run `python -m spacy download en_core_web_sm`.

### License

This project is released under the [MIT License](LICENSE).
