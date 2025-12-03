import os, json, glob, numpy as np
from sentence_transformers import SentenceTransformer

# PDF processing
try:
    from pypdf import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    try:
        from PyPDF2 import PdfReader
        PDF_AVAILABLE = True
    except ImportError:
        PDF_AVAILABLE = False
        print("Warning: PDF processing not available. Install pypdf: pip install pypdf")

MODEL = None
def _model():
    global MODEL
    if MODEL is None:
        MODEL = SentenceTransformer("intfloat/e5-base")
    return MODEL


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file."""
    if not PDF_AVAILABLE:
        raise ImportError("PDF processing library not installed. Install with: pip install pypdf")
    
    try:
        reader = PdfReader(pdf_path)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text.strip():
                text_parts.append(text.strip())
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    """
    Split text into overlapping chunks for better retrieval.
    
    Args:
        text: The text to chunk
        chunk_size: Maximum characters per chunk
        overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary
        if end < len(text):
            # Look for sentence endings near the end
            for punct in ['. ', '.\n', '! ', '?\n', '?\n']:
                last_punct = chunk.rfind(punct)
                if last_punct > chunk_size * 0.7:  # If we find punctuation in last 30%
                    chunk = chunk[:last_punct + 1]
                    end = start + len(chunk)
                    break
        
        chunks.append(chunk.strip())
        start = end - overlap  # Overlap for context
    
    return chunks


def build_index(data_dir: str, out_path: str, chunk_documents: bool = True, chunk_size: int = 1000):
    """
    Build an embedding index from markdown and PDF files.
    
    Args:
        data_dir: Directory containing .md and .pdf files (searches recursively in subdirectories)
        out_path: Output path for index files (without extension)
        chunk_documents: Whether to split large documents into chunks
        chunk_size: Size of chunks if chunking is enabled
    """
    # Find all markdown and PDF files recursively in subdirectories
    md_files = glob.glob(os.path.join(data_dir, "**", "*.md"), recursive=True)
    pdf_files = glob.glob(os.path.join(data_dir, "**", "*.pdf"), recursive=True) if PDF_AVAILABLE else []
    
    all_files = md_files + pdf_files
    
    if not all_files:
        print(f"Warning: No .md or .pdf files found in {data_dir}")
        return
    
    print(f"Found {len(md_files)} markdown files and {len(pdf_files)} PDF files")
    
    docs = []
    
    # Process markdown files
    for fp in md_files:
        try:
            with open(fp, "r", encoding="utf-8") as f:
                txt = f.read().strip()
            
            if not txt:
                continue
            
            # Get relative path from data_dir to preserve folder structure
            rel_path = os.path.relpath(fp, data_dir)
            file_id = rel_path.replace(os.sep, "/")  # Use forward slashes for consistency
            
            if chunk_documents and len(txt) > chunk_size:
                # Split into chunks
                chunks = chunk_text(txt, chunk_size)
                for i, chunk in enumerate(chunks):
                    docs.append({
                        "id": f"{file_id}#chunk_{i+1}",
                        "text": chunk,
                        "source_file": file_id,
                        "chunk_index": i + 1,
                        "total_chunks": len(chunks)
                    })
            else:
                docs.append({
                    "id": file_id,
                    "text": txt,
                    "source_file": file_id
                })
            print(f"✓ Processed {file_id}")
        except Exception as e:
            print(f"✗ Error processing {fp}: {e}")
    
    # Process PDF files
    for fp in pdf_files:
        try:
            txt = extract_text_from_pdf(fp)
            
            if not txt.strip():
                print(f"⚠ Warning: No text extracted from {os.path.basename(fp)}")
                continue
            
            # Get relative path from data_dir to preserve folder structure
            rel_path = os.path.relpath(fp, data_dir)
            file_id = rel_path.replace(os.sep, "/")  # Use forward slashes for consistency
            
            if chunk_documents and len(txt) > chunk_size:
                # Split into chunks
                chunks = chunk_text(txt, chunk_size)
                for i, chunk in enumerate(chunks):
                    docs.append({
                        "id": f"{file_id}#chunk_{i+1}",
                        "text": chunk,
                        "source_file": file_id,
                        "chunk_index": i + 1,
                        "total_chunks": len(chunks)
                    })
            else:
                docs.append({
                    "id": file_id,
                    "text": txt,
                    "source_file": file_id
                })
            print(f"✓ Processed {file_id} ({len(txt)} characters)")
        except Exception as e:
            print(f"✗ Error processing {fp}: {e}")
    
    if not docs:
        print("Error: No documents were successfully processed")
        return
    
    print(f"\nGenerating embeddings for {len(docs)} documents...")
    model = _model()
    
    # Generate embeddings in batches for better performance
    batch_size = 32
    embeddings = []
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i + batch_size]
        batch_texts = [d["text"] for d in batch]
        batch_emb = model.encode(batch_texts, normalize_embeddings=True, show_progress_bar=True)
        embeddings.extend(batch_emb)
        print(f"  Processed {min(i + batch_size, len(docs))}/{len(docs)} documents")
    
    emb_array = np.array(embeddings)
    
    # Save embeddings
    np.save(out_path + ".npy", emb_array)
    print(f"✓ Saved embeddings to {out_path}.npy")
    
    # Save document metadata
    with open(out_path + ".json", "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved document index to {out_path}.json")
    
    print(f"\n✅ Index built successfully with {len(docs)} documents!")


if __name__ == "__main__":
    build_index("healthmate/data/guidelines", "healthmate/retriever/guidelines_index")
