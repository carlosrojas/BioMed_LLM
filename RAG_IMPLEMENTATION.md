# RAG Implementation in HealthMate

## Overview

This document explains the Retrieval-Augmented Generation (RAG) implementation in the HealthMate chatbot. RAG combines semantic search over medical guidelines with LLM-based answer generation to provide accurate, evidence-based health information.

## Architecture

### Components

1. **Retrieval System** (`healthmate/retriever/`)
   - **Indexer** (`indexer.py`): Builds embeddings index from medical guideline documents
   - **Search** (`search.py`): Performs semantic similarity search using sentence-transformers
   - **Model**: Uses `intfloat/e5-base` for generating embeddings
   - **Index Format**: 
     - `guidelines_index.json`: Document metadata and text
     - `guidelines_index.npy`: Pre-computed embeddings

2. **RAG Pipeline** (`healthmate/llm/rag.py`)
   - Retrieves relevant documents using `hybrid_search()`
   - Builds context from retrieved documents
   - Generates answer using Ollama LLM with context

3. **LLM Integration** (`healthmate/llm/ollama_generate.py`)
   - Interfaces with Ollama API (local LLM server)
   - Model: `llama3.1:8b` (configurable)
   - Formats prompt with context and question

4. **Safety Gate** (`healthmate/api/safety.py`)
   - Detects urgent medical conditions
   - Validates that sources were retrieved
   - Returns appropriate status (ok/urgent/abstain)

## How RAG Works

### Flow Diagram

```
User Query
    ↓
[1] Semantic Search (hybrid_search)
    ↓
Retrieved Documents (top-k=3)
    ↓
[2] Context Building (build_context)
    ↓
Formatted Context + System Instructions
    ↓
[3] LLM Generation (generate_with_ollama)
    ↓
Answer + Sources
    ↓
[4] Safety Gate (safety_gate)
    ↓
Final Response (status, message, sources)
```

### Step-by-Step Process

1. **Query Processing**
   - User sends a message through the frontend
   - Backend combines message with conversation history
   - Full prompt is used for retrieval to maintain context

2. **Document Retrieval** (`hybrid_search`)
   - Query is encoded into embedding using `e5-base` model
   - Cosine similarity search against pre-computed document embeddings
   - Returns top-k (default: 3) most relevant documents
   - Each hit includes: `id`, `text`, `score`

3. **Context Building** (`build_context`)
   - Formats retrieved documents into structured context
   - Adds system instructions for the LLM
   - Emphasizes using only provided sources

4. **Answer Generation** (`answer_with_context`)
   - Sends formatted context + user question to Ollama
   - LLM generates answer based on retrieved medical guidelines
   - Returns answer, model name, and prompts for logging

5. **Safety Validation** (`safety_gate`)
   - Checks for urgent symptoms (chest pain, stroke signs, etc.)
   - Validates that sources were retrieved
   - Returns appropriate status and message

6. **Response Formatting**
   - Combines answer, status, retrieved sources, and interaction ID
   - Frontend displays message with source citations
   - Shows status indicators for urgent/abstain responses

## Key Features

### 1. Semantic Search
- Uses sentence-transformers for high-quality embeddings
- Normalized embeddings enable efficient cosine similarity
- Pre-computed index for fast retrieval

### 2. Context-Aware Retrieval
- Uses full conversation history for better context
- Maintains coherence across multi-turn conversations

### 3. Safety Mechanisms
- **Urgent Detection**: Pattern matching for emergency symptoms
- **Source Validation**: Ensures answers are based on retrieved documents
- **Abstain Mode**: Refuses to answer when no sources are found

### 4. Source Attribution
- Displays retrieved source IDs in the UI
- Users can view which medical guidelines informed the answer
- Helps build trust and transparency

### 5. Interaction Logging
- All interactions logged to MongoDB
- Includes prompts, responses, retrieved documents, and feedback
- Enables future model fine-tuning and analytics

## Frontend Integration

### Response Structure
```typescript
{
  status: "ok" | "urgent" | "abstain",
  message: string,           // The LLM-generated answer
  retrieved: Array<{          // Retrieved documents
    id: string,
    text: string,
    score: number
  }>,
  interaction_id: string      // For feedback tracking
}
```

### UI Features
- **Status Indicators**: Visual alerts for urgent/abstain responses
- **Source Display**: Expandable list of source documents
- **Confidence Scores**: Visual confidence indicators
- **Feedback System**: Thumbs up/down for continuous improvement

## Configuration

### Model Settings
- **Embedding Model**: `intfloat/e5-base` (sentence-transformers)
- **LLM Model**: `llama3.1:8b` (Ollama)
- **Retrieval Count**: 3 documents (configurable via `k` parameter)

### Index Building
To rebuild the index with new documents:
```bash
python healthmate/retriever/indexer.py
```
This processes all `.md` files in `healthmate/data/guidelines/` and generates the index files.

## Improvements Made

1. **Fixed Prompt Structure**: Corrected the prompt building to properly use `generate_with_ollama` signature
2. **Model Name Update**: Changed from `medqwen` to `llama3.1:8b` to match README
3. **Enhanced Context Formatting**: Improved system instructions and context structure
4. **Frontend Response Handling**: Fixed extraction of message, status, and sources
5. **Source Display**: Added UI to show retrieved sources
6. **Status Indicators**: Visual feedback for urgent/abstain responses

## Future Enhancements

1. **Hybrid Search**: Combine semantic search with keyword/BM25 search
2. **Re-ranking**: Use cross-encoder to re-rank retrieved documents
3. **Chunking**: Split large documents into smaller chunks for better retrieval
4. **Query Expansion**: Expand queries with medical synonyms
5. **Multi-hop Retrieval**: Iterative retrieval for complex questions
6. **Citation Extraction**: Extract specific citations from generated answers

## Testing

To test the RAG system:

1. **Start Ollama**:
   ```bash
   ollama serve
   ollama pull llama3.1:8b
   ```

2. **Start Backend**:
   ```bash
   uvicorn healthmate.api.main:app --reload
   ```

3. **Test Query**:
   ```bash
   curl -X POST http://127.0.0.1:8000/chat \
     -H "Content-Type: application/json" \
     -d '{"text": "I have a headache", "history": null}'
   ```

4. **Verify Response**:
   - Check that `retrieved` array contains relevant documents
   - Verify `status` is "ok", "urgent", or "abstain"
   - Confirm `message` contains the generated answer

## Troubleshooting

### No Sources Retrieved
- Check that `guidelines_index.json` and `guidelines_index.npy` exist
- Verify index was built correctly
- Ensure documents are in `healthmate/data/guidelines/`

### LLM Not Responding
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check model is pulled: `ollama list`
- Review Ollama logs for errors

### Poor Retrieval Quality
- Rebuild index with more documents
- Adjust `k` parameter (number of retrieved documents)
- Consider using a medical-domain embedding model

