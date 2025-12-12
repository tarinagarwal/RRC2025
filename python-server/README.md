# Multi-Modal RAG Q&A App with Gemini Pro

A sophisticated Question & Answer application that combines text and image understanding using Google's Gemini Pro models. This app implements Multi-Modal Retrieval-Augmented Generation (RAG) to provide comprehensive answers based on uploaded documents and images.

## 🌟 Features

- **Multi-Modal Processing**: Handles both PDF documents and images
- **Text Summarization**: Uses Gemini Pro to create optimized summaries for retrieval
- **Image Analysis**: Leverages Gemini Pro Vision for image understanding
- **Smart Retrieval**: Multi-vector retriever that indexes summaries but returns raw content
- **Web Interface**: Easy-to-use web interface for document upload and querying
- **API Endpoints**: RESTful API for programmatic access

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **LLM**: Google Gemini Pro & Gemini Pro Vision
- **Framework**: LangChain
- **Vector Database**: ChromaDB
- **Document Processing**: PyPDF for PDF handling
- **Image Processing**: Pillow (PIL)

## 📋 Prerequisites

1. **Python 3.13+**
2. **Google API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project
cd python-server

# Install dependencies (already configured in pyproject.toml)
pip install -e .
```

### 2. Setup Google API Key

You'll need a Google API key to use Gemini Pro models:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it as an environment variable:

**PowerShell:**
```powershell
$env:GOOGLE_API_KEY = "your-api-key-here"
```

**Command Prompt:**
```cmd
set GOOGLE_API_KEY=your-api-key-here
```

### 3. Run the Application

```bash
python main.py
```

The server will start at `http://localhost:5000`

### 4. Access the Web Interface

Open your browser and go to: `http://localhost:5000/app`

## 📖 Usage

### Web Interface

1. **Enter API Key**: Paste your Google API key in the form
2. **Upload Documents**: 
   - Select a PDF file (required)
   - Optionally upload images (JPG, PNG, GIF)
3. **Process**: Click "Upload & Process Documents"
4. **Ask Questions**: Once processing is complete, ask questions about your documents

### API Endpoints

#### Upload Documents
```bash
POST /upload
Content-Type: multipart/form-data

# Form data:
# - api_key: Your Google API key
# - pdf_file: PDF file
# - image_files: Image files (optional, multiple)
```

#### Query Documents
```bash
POST /query
Content-Type: application/json

{
  "question": "What are the main topics in this document?"
}
```

#### Check Status
```bash
GET /status
```

### Programmatic Usage

```python
from main import MultiModalRAG

# Initialize with API key
rag_system = MultiModalRAG(api_key="your-api-key")

# Process documents
result = rag_system.process_documents("document.pdf", "images/")

# Query the system
answer = rag_system.query("What are the key findings?")
print(answer)
```

## 🧪 Testing

Run the test script to verify everything works:

```bash
python test_rag.py
```

## 📁 Project Structure

```
python-server/
├── main.py              # Main Flask application with RAG implementation
├── test_rag.py          # Test script for the RAG system
├── templates/
│   └── index.html       # Web interface
├── pyproject.toml       # Dependencies and project configuration
└── README.md           # This file
```

## 🔧 Key Components

### MultiModalRAG Class

The core class that handles:
- Document loading and processing
- Text and image summarization
- Multi-vector retrieval setup
- Query processing and answer generation

### Key Methods

- `load_pdf_documents()`: Extract text from PDF files
- `generate_text_summaries()`: Create optimized text summaries
- `generate_img_summaries()`: Analyze and summarize images
- `create_multi_vector_retriever()`: Build the retrieval system
- `query()`: Process questions and generate answers

## 💡 Example Questions

- "What are the main topics discussed in this document?"
- "Can you summarize the key findings?"
- "What information is shown in the images?"
- "Compare the data from different sections."
- "What are the technical specifications mentioned?"

## 🔒 Security Notes

- API keys are handled securely and not stored permanently
- Uploaded files are processed and cleaned up automatically
- The app runs in debug mode for development (disable for production)

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Google API key is valid and has access to Gemini Pro models
2. **Dependencies**: Make sure all packages are installed correctly
3. **File Upload**: Check file formats (PDF for documents, JPG/PNG/GIF for images)
4. **Memory**: Large documents may require more memory for processing

### Error Messages

- "No documents have been processed": Upload and process documents first
- "Error processing document": Check your API key and document format
- "No relevant context found": Try rephrasing your question or upload more relevant documents

## 🎯 Use Cases

- **Research**: Analyze academic papers and research documents
- **Business**: Process reports, presentations, and business documents
- **Education**: Study materials, textbooks, and educational content
- **Legal**: Document review and analysis
- **Healthcare**: Medical document analysis (ensure compliance with regulations)

## 🔮 Future Enhancements

- Support for more document formats (DOCX, TXT, etc.)
- Advanced image processing and OCR
- Conversation history and context memory
- Batch processing for multiple documents
- Integration with cloud storage services
- Advanced query filtering and search options

## 📄 License

This project is for educational and development purposes. Ensure you comply with Google's API terms of service when using Gemini Pro models.

## 🤝 Contributing

Feel free to submit issues, suggestions, or improvements to enhance the Multi-Modal RAG Q&A App!