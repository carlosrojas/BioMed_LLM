# Quick Guide: Adding PDFs to HealthMate RAG System

## 📋 Summary

Your RAG system is now ready to process PDFs! Here's what you need to do:

## 🚀 Quick Steps

### 1. Install PDF Processing Library

```bash
pip install pypdf
```

Or if you're using the requirements file:
```bash
pip install -r requirements.txt
```

### 2. Place Your PDFs in the Directory

Copy all your medical PDF files to:
```
healthmate/data/guidelines/
```

**Example:**
```bash
# Copy a single PDF
cp /path/to/your/medical_guideline.pdf healthmate/data/guidelines/

# Or copy multiple PDFs at once
cp /path/to/your/pdfs/*.pdf healthmate/data/guidelines/
```

### 3. Rebuild the Index

Run the indexer to process all PDFs and markdown files:

```bash
python healthmate/retriever/indexer.py
```

You'll see output like:
```
Found 0 markdown files and 5 PDF files
✓ Processed diabetes_guidelines.pdf (45230 characters)
✓ Processed hypertension_treatment.pdf (32100 characters)
...
Generating embeddings for 15 documents...
  Processed 15/15 documents
✓ Saved embeddings to healthmate/retriever/guidelines_index.npy
✓ Saved document index to healthmate/retriever/guidelines_index.json
✅ Index built successfully with 15 documents!
```

### 4. Restart Your API (if running)

If your FastAPI server is running, restart it:

```bash
# Stop with Ctrl+C, then restart
uvicorn healthmate.api.main:app --reload
```

## 📁 Directory Structure

```
healthmate/
├── data/
│   └── guidelines/          ← PUT YOUR PDFs HERE
│       ├── your_file1.pdf
│       ├── your_file2.pdf
│       └── README.md
└── retriever/
    ├── indexer.py           ← Run this to rebuild index
    ├── guidelines_index.json
    └── guidelines_index.npy
```

## ✨ Features

### Automatic Chunking
- Large PDFs are automatically split into smaller chunks (1000 characters each)
- This improves retrieval accuracy
- Chunks overlap by 200 characters to preserve context

### Source Attribution
- Each PDF filename becomes a source identifier
- Users see source names in the "View Sources" section
- Example: `diabetes_guidelines.pdf` → "Diabetes Guidelines"

### Multiple File Types
- Supports both `.md` (markdown) and `.pdf` files
- Mix and match as needed

## 🔍 Verifying It Works

After rebuilding the index, test it:

1. Start your API: `uvicorn healthmate.api.main:app --reload`
2. Ask a question related to your PDFs
3. Check that the answer shows sources from your PDFs

## ⚠️ Important Notes

1. **PDF Quality**: PDFs must contain actual text (not scanned images). Scanned PDFs won't work unless you OCR them first.

2. **File Size**: Very large PDFs may take time to process. The indexer shows progress.

3. **Rebuild Required**: Every time you add new PDFs, you must rebuild the index.

4. **File Names**: Use descriptive filenames - they appear as source names to users.

## 🐛 Troubleshooting

### "PDF processing library not installed"
```bash
pip install pypdf
```

### "No text extracted from PDF"
- PDF might be scanned (image-based). Use OCR to convert to text first.
- PDF might be password-protected. Remove password protection.

### "Index not updating"
- Make sure you ran `python healthmate/retriever/indexer.py`
- Check that files are in `healthmate/data/guidelines/` (not a subdirectory)
- Verify the index files were updated (check modification time)

### "Index takes too long"
- This is normal for large PDFs
- The indexer processes in batches and shows progress
- Very large files (100+ pages) may take several minutes

## 📚 Next Steps

Once your PDFs are indexed:
- Test with various medical questions
- Check that sources appear correctly
- Monitor the quality of retrieved documents
- Consider adding more specialized medical documents

For more details, see `healthmate/data/guidelines/README.md`

