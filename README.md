# Image Resizer & Converter

A modern web app for resizing images, compressing them, and converting between image formats, PDF, and DOCX—all in your browser.

## Features
- Resize and compress images (PNG, JPEG)
- Convert images to PDF
- Convert images to DOCX (PNG/JPEG only)
- Extract images from PDF and DOCX
- Beautiful UI with navbar and footer
- No server upload—everything runs in your browser

## How to Use
1. **Resize Images**
   - Click "Resize" in the navbar.
   - Upload an image, set width/height/quality, and download the result.
2. **Convert Images & Documents**
   - Click "Convert" in the navbar.
   - Choose conversion type (image to PDF/DOCX, PDF/DOCX to images).
   - Upload files and click "Convert".
   - Download the converted file(s).

## Supported Formats
- **Image to PDF/DOCX:** PNG, JPEG
- **PDF to Images:** All PDF pages as PNG
- **DOCX to Images:** Extracts embedded images

## Setup
No installation required! Just open `index.html` in your browser.

### External Libraries Used
- [jsPDF](https://github.com/parallax/jsPDF) (PDF generation)
- [docx.js](https://github.com/dolanmiu/docx) (DOCX generation)
- [pdf.js](https://github.com/mozilla/pdf.js) (PDF parsing)
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX parsing)

These are loaded via CDN in `index.html`.

## Customization
- Edit `style.css` for colors, layout, and appearance.
- Update `script.js` for logic and features.

## Troubleshooting
- Only PNG/JPEG images are supported for DOCX conversion.
- If conversion fails, check your browser console for errors.
- Make sure you have a stable internet connection to load external libraries.

## License
MIT
