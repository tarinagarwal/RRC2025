# contact_detector_v3.py
# Fault-tolerant contact + social info detector using Groq Vision
# Model: meta-llama/llama-4-scout-17b-16e-instruct
# Input: PDF → images → LLM extraction → JSON output

import re
import json
import logging
from pathlib import Path
from groq import Groq

# ---- Groq Client ----
client = Groq(api_key="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")

# ---- PDF to Image Conversion using PyMuPDF ----
try:
    import fitz
except ImportError:
    fitz = None
    logging.warning("PyMuPDF (fitz) not available. PDF-to-image conversion will fail.")


def pdf_to_images(pdf_path):
    """Convert a PDF into a list of PIL images using PyMuPDF."""
    if fitz is None:
        raise RuntimeError("PyMuPDF (fitz) not installed. Install with: pip install PyMuPDF")

    try:
        pdf_document = fitz.open(pdf_path)
        images = []
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for quality
            img_data = pix.tobytes("ppm")
            
            # Convert PPM to PIL Image
            from PIL import Image
            from io import BytesIO
            img = Image.open(BytesIO(img_data))
            images.append(img)
        
        pdf_document.close()
        return images
    except Exception as e:
        logging.error(f"Error converting PDF to images: {e}")
        raise


def encode_image(img):
    """Encode a PIL image as base64 PNG for Groq Vision."""
    import base64
    from io import BytesIO

    try:
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        logging.error(f"Image encoding failed: {e}")
        return None


def call_groq_vision(encoded_images):
    """Send images to Groq's vision model and return extracted JSON text."""
    prompt = """Extract structured information from the resume image(s).

Return ONLY valid JSON in the following structure:

{
  "contact": {
    "name": "",
    "phone": "",
    "email": "",
    "address": "",
    "socials": {
      "linkedin": "",
      "github": "",
      "twitter": "",
      "facebook": "",
      "instagram": "",
      "portfolio": "",
      "other": []
    }
  },
  "summary": "",
  "education": [
    {
      "degree": "",
      "institution": "",
      "location": "",
      "start_year": "",
      "end_year": "",
      "grade": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": []
  },
  "experience": [
    {
      "role": "",
      "company": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "technologies": []
    }
  ],
  "certifications": [
    {
      "title": "",
      "issuer": "",
      "year": ""
    }
  ]
}

Rules:
- If a field is missing, return an empty string or empty list.
- Do NOT hallucinate. Only extract what is visible in the resume.
- Keep descriptions concise.
- Preserve original ordering when possible."""

    # Build user content with images and text
    user_content = []
    
    # Add images first
    for img_b64 in encoded_images:
        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{img_b64}"
            }
        })
    
    # Add text prompt
    user_content.append({
        "type": "text",
        "text": prompt
    })

    messages = [
        {"role": "user", "content": user_content}
    ]

    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=messages,
            temperature=0.1,
            max_tokens=4096
        )

        text = response.choices[0].message.content
        return text

    except Exception as e:
        logging.error(f"Groq call failed: {e}")
        return "{}"


def safe_json_load(text):
    """Safely parse JSON from LLM output."""
    try:
        return json.loads(text)
    except Exception:
        logging.warning("Direct JSON parsing failed. Attempting recovery...")

        try:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception:
            pass

        return {
            "name": "",
            "phone": "",
            "email": "",
            "address": "",
            "socials": {}
        }


def detect_contact_info(pdf_path):
    """Main function to extract contact + social details from a resume."""
    try:
        images = pdf_to_images(pdf_path)
    except Exception:
        return {
            "error": "PDF could not be processed."
        }

    encoded = [encode_image(img) for img in images]
    encoded = [e for e in encoded if e]

    if not encoded:
        return {"error": "Failed to encode images."}

    llm_output = call_groq_vision(encoded)
    parsed = safe_json_load(llm_output)

    return parsed


# ---- Script execution (no argparse) ----
if __name__ == "__main__":
    script_dir = Path(__file__).parent
    pdf_path = script_dir / "resume.pdf"
    results = detect_contact_info(pdf_path)

    print("\n=== CONTACT INFO DETECTED ===\n")
    print(json.dumps(results, indent=4))
    
    # Save to JSON file
    output_path = script_dir / "resume.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
    print(f"\n✓ Results saved to {output_path}")
