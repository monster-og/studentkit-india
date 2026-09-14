/**
 * StudentKit India - Client-Side Image Resizer
 * Resize for Indian Exam Forms, Passport Photos, and Signatures
 */

export function initImageResizer(showToast) {
  const dropZone = document.getElementById('resize-drop-zone');
  const fileInput = document.getElementById('resize-file-input');
  const widthInput = document.getElementById('resize-width-input');
  const heightInput = document.getElementById('resize-height-input');
  const lockAspectBtn = document.getElementById('resize-lock-aspect');
  const formatSelect = document.getElementById('resize-format-select');
  const qualitySlider = document.getElementById('resize-quality-slider');
  const qualityVal = document.getElementById('resize-quality-val');
  const resizeActionBtn = document.getElementById('resize-action-btn');
  const downloadBtn = document.getElementById('resize-download-btn');

  const previewPanel = document.getElementById('resize-preview-panel');
  const origImg = document.getElementById('resize-orig-img');
  const origSizeBadge = document.getElementById('resize-orig-size');
  const origDims = document.getElementById('resize-orig-dims');

  const resImg = document.getElementById('resize-result-img');
  const resSizeBadge = document.getElementById('resize-result-size');
  const resDims = document.getElementById('resize-result-dims');

  let currentFile = null;
  let originalImageObj = null;
  let resizedBlob = null;
  let isAspectLocked = true;
  let originalAspectRatio = 1.0;

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast?.('Please upload a valid image file', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImageObj = img;
        originalAspectRatio = img.naturalWidth / img.naturalHeight;

        if (origImg) origImg.src = e.target.result;
        if (origSizeBadge) origSizeBadge.textContent = formatBytes(file.size);
        if (origDims) origDims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

        if (widthInput) widthInput.value = img.naturalWidth;
        if (heightInput) heightInput.value = img.naturalHeight;

        if (previewPanel) previewPanel.style.display = 'grid';
        resizeImage();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Aspect ratio lock toggle
  lockAspectBtn?.addEventListener('click', () => {
    isAspectLocked = !isAspectLocked;
    lockAspectBtn.classList.toggle('locked', isAspectLocked);
    lockAspectBtn.title = isAspectLocked ? 'Aspect Ratio: Locked' : 'Aspect Ratio: Unlocked';
  });

  // Dimension sync when locked
  widthInput?.addEventListener('input', () => {
    if (isAspectLocked && originalAspectRatio) {
      const w = parseFloat(widthInput.value) || 0;
      if (heightInput) heightInput.value = Math.round(w / originalAspectRatio);
    }
  });

  heightInput?.addEventListener('input', () => {
    if (isAspectLocked && originalAspectRatio) {
      const h = parseFloat(heightInput.value) || 0;
      if (widthInput) widthInput.value = Math.round(h * originalAspectRatio);
    }
  });

  qualitySlider?.addEventListener('input', (e) => {
    if (qualityVal) qualityVal.textContent = `${e.target.value}%`;
  });

  // Canvas Resize execution
  async function resizeImage() {
    if (!originalImageObj || !currentFile) {
      showToast?.('Please upload an image first', 'info');
      return;
    }

    const targetW = parseInt(widthInput?.value, 10) || 100;
    const targetH = parseInt(heightInput?.value, 10) || 100;
    const format = formatSelect?.value || 'image/jpeg';
    const quality = (parseFloat(qualitySlider?.value) || 90) / 100;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // High quality canvas scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(originalImageObj, 0, 0, targetW, targetH);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
    if (!blob) {
      showToast?.('Failed to resize image', 'error');
      return;
    }

    resizedBlob = blob;
    const url = URL.createObjectURL(blob);
    if (resImg) resImg.src = url;
    if (resSizeBadge) resSizeBadge.textContent = formatBytes(blob.size);
    if (resDims) resDims.textContent = `${targetW} × ${targetH} px`;

    if (downloadBtn) downloadBtn.disabled = false;
    showToast?.(`Resized to ${targetW} × ${targetH} px successfully!`, 'success');
  }

  // Presets
  document.querySelectorAll('#resizer-view .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#resizer-view .preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const w = parseInt(chip.dataset.width, 10);
      const h = parseInt(chip.dataset.height, 10);

      // Temporarily unlock aspect ratio so preset exact dimensions are applied
      const prevLock = isAspectLocked;
      isAspectLocked = false;

      if (widthInput) widthInput.value = w;
      if (heightInput) heightInput.value = h;

      isAspectLocked = prevLock;

      if (originalImageObj) resizeImage();
    });
  });

  // Drag & drop listeners
  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  resizeActionBtn?.addEventListener('click', resizeImage);

  // Download Handler - Blob to DataURL for guaranteed file-manager download
  function triggerDownload(blob, fileName) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const a = document.createElement('a');
      a.href = reader.result; // base64 data URL — always triggers Save As / Downloads
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 200);
    };
    reader.readAsDataURL(blob);
  }

  downloadBtn?.addEventListener('click', () => {
    if (!resizedBlob || !currentFile) return;
    const ext = formatSelect?.value === 'image/png' ? 'png'
      : formatSelect?.value === 'image/webp' ? 'webp'
      : 'jpg';
    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const fileName = `studentkit-resized-${widthInput.value}x${heightInput.value}.${ext}`;
    triggerDownload(resizedBlob, fileName);
    showToast?.('File saved to your Downloads folder! 🎉', 'success');
  });
}
