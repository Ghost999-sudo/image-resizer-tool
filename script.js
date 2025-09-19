const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const qualityInput = document.getElementById('quality');
const downloadBtn = document.getElementById('download');

let img = new Image();

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    img.src = reader.result;
  };
});

img.onload = () => {
  widthInput.value = img.width;
  heightInput.value = img.height;
  processImage();
};

function processImage() {
  const newWidth = parseInt(widthInput.value);
  const newHeight = parseInt(heightInput.value);
  const quality = parseFloat(qualityInput.value);

  canvas.width = newWidth;
  canvas.height = newHeight;

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  downloadBtn.disabled = false;
  downloadBtn.onclick = () => {
    const link = document.createElement('a');
    link.download = "compressed-image.jpg";
    link.href = canvas.toDataURL("image/jpeg", quality);
    link.click();
  };
}

widthInput.addEventListener('input', processImage);
heightInput.addEventListener('input', processImage);

qualityInput.addEventListener('input', processImage);

// Conversion logic
const convertInput = document.getElementById('convertInput');
const convertType = document.getElementById('convertType');
const convertBtn = document.getElementById('convertBtn');
const convertResult = document.getElementById('convertResult');

convertBtn.addEventListener('click', async () => {
  const files = convertInput.files;
  if (!files.length) {
    convertResult.textContent = 'Please select files.';
    return;
  }
  convertResult.textContent = '';
  const type = convertType.value;
  if (type === 'img2pdf') {
    // Images to PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgData = await fileToDataURL(file);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, 10, 180, 160);
    }
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, 'images.pdf');
    convertResult.textContent = 'PDF created!';
  } else if (type === 'img2docx') {
    // Images to DOCX with error handling
    if (!window.docx) {
      convertResult.textContent = 'DOCX library not loaded.';
      return;
    }
    const doc = new window.docx.Document();
    const children = [];
    let errorOccurred = false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only PNG and JPEG supported
      if (!file.type.match(/image\/(png|jpeg)/)) {
        convertResult.textContent = `Unsupported image format: ${file.name}`;
        errorOccurred = true;
        break;
      }
      try {
        const imgData = await fileToArrayBuffer(file);
        children.push(new window.docx.Paragraph({
          children: [
            new window.docx.ImageRun({
              data: imgData,
              transformation: { width: 400, height: 300 }
            })
          ]
        }));
      } catch (err) {
        convertResult.textContent = `Error reading image: ${file.name}`;
        errorOccurred = true;
        break;
      }
    }
    if (errorOccurred) return;
    doc.addSection({ children });
    window.docx.Packer.toBlob(doc).then(blob => {
      downloadBlob(blob, 'images.docx');
      convertResult.textContent = 'DOCX created!';
    }).catch(() => {
      convertResult.textContent = 'Failed to create DOCX file.';
    });
  } else if (type === 'pdf2img') {
    // PDF to Images
    const file = files[0];
    const pdfData = await fileToArrayBuffer(file);
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      canvas.toBlob(blob => {
        downloadBlob(blob, `page${i}.png`);
      }, 'image/png');
    }
    convertResult.textContent = 'Images extracted from PDF!';
  } else if (type === 'docx2img') {
    // DOCX to Images (extract images from DOCX)
    const file = files[0];
    const arrayBuffer = await fileToArrayBuffer(file);
    window.mammoth.convertToHtml({ arrayBuffer }).then(result => {
      // Extract images from HTML
      const div = document.createElement('div');
      div.innerHTML = result.value;
      const imgs = div.querySelectorAll('img');
      if (imgs.length === 0) {
        convertResult.textContent = 'No images found in DOCX.';
        return;
      }
      imgs.forEach((img, idx) => {
        fetch(img.src)
          .then(res => res.blob())
          .then(blob => downloadBlob(blob, `docx_img${idx + 1}.png`));
      });
      convertResult.textContent = 'Images extracted from DOCX!';
    });
  }
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
}
