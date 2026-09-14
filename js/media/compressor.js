/**
 * StudentKit India - Client-Side Image Compressor
 * 100% Private - Works entirely inside the browser canvas
 */

export function initImageCompressor(showToast) {
  const dropZone = document.getElementById('compress-drop-zone');
  const fileInput = document.getElementById('compress-file-input');
  const targetKbInput = document.getElementById('compress-target-kb');
  const targetKbSlider = document.getElementById('compress-target-slider');
  const compressActionBtn = document.getElementById('compress-action-btn');
  const downloadBtn = document.getElementById('compress-download-btn');

  const previewPanel = document.getElementById('compress-preview-panel');
  const origImg = document.getElementById('compress-orig-img');
  const origSizeBadge = document.getElementById('compress-orig-size');
  const origDims = document.getElementById('compress-orig-dims');

  const compImg = document.getElementById('compress-result-img');
  const compSizeBadge = document.getElementById('compress-result-size');
  const compReduction = document.getElementById('compress-reduction-badge');
  const compDims = document.getElementById('compress-result-dims');

  let currentFile = null;
  let originalImageObj = null;
  let compressedBlob = null;

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // Handle file selection
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast?.('Please upload a valid image (JPG, PNG, WebP)', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImageObj = img;
        if (origImg) origImg.src = e.target.result;
        if (origSizeBadge) origSizeBadge.textContent = formatBytes(file.size);
        if (origDims) origDims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

        // If target size is larger than current image, adjust target size down
        const currentKb = Math.round(file.size / 1024);
        if (targetKbInput && currentKb < parseInt(targetKbInput.value, 10)) {
          const suggested = Math.max(10, Math.floor(currentKb * 0.6));
          targetKbInput.value = suggested;
          if (targetKbSlider) targetKbSlider.value = suggested;
        }

        if (previewPanel) previewPanel.style.display = 'grid';
        compressImage();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Binary search compression using Canvas
  async function compressImage() {
    if (!originalImageObj || !currentFile) {
      showToast?.('Please select an image first', 'info');
      return;
    }

    const targetKb = parseFloat(targetKbInput?.value) || 50;
    const targetBytes = targetKb * 1024;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width = originalImageObj.naturalWidth;
    let height = originalImageObj.naturalHeight;

    // Binary search for ideal quality and dimension scale
    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob = null;
    let bestDiff = Infinity;

    // If file is already huge, downscale initial dimensions to reasonable bounds
    let scale = 1.0;
    if (width > 2400 || height > 2400) {
      scale = 2400 / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(originalImageObj, 0, 0, width, height);

    // Iterative quality search
    for (let i = 0; i < 7; i++) {
      const midQ = (minQ + maxQ) / 2;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', midQ));

      if (!blob) break;

      if (blob.size <= targetBytes) {
        bestBlob = blob;
        minQ = midQ; // Try to get higher quality while staying under limit
      } else {
        maxQ = midQ; // Too big, decrease quality
      }
    }

    // If even at minimum quality it is still over target, scale dimensions down
    if (!bestBlob || bestBlob.size > targetBytes) {
      for (let s = 0.85; s >= 0.2; s -= 0.15) {
        canvas.width = Math.round(width * s);
        canvas.height = Math.round(height * s);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImageObj, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.65));
        if (blob && blob.size <= targetBytes) {
          bestBlob = blob;
          break;
        }
        bestBlob = blob;
      }
    }

    if (!bestBlob) {
      showToast?.('Could not compress to this exact size', 'error');
      return;
    }

    compressedBlob = bestBlob;
    const resultUrl = URL.createObjectURL(bestBlob);
    if (compImg) compImg.src = resultUrl;
    if (compSizeBadge) compSizeBadge.textContent = formatBytes(bestBlob.size);
    if (compDims) compDims.textContent = `${canvas.width} × ${canvas.height} px`;

    // Calculate reduction percentage
    const reduction = (((currentFile.size - bestBlob.size) / currentFile.size) * 100).toFixed(1);
    if (compReduction) {
      compReduction.textContent = `${reduction > 0 ? '-' : '+'}${Math.abs(reduction)}%`;
      compReduction.className = `status-pill ${reduction >= 0 ? 'safe' : 'warning'}`;
    }

    if (downloadBtn) downloadBtn.disabled = false;
    showToast?.(`Compressed to ${formatBytes(bestBlob.size)} successfully!`, 'success');
  }

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

  // Slider & input sync
  targetKbSlider?.addEventListener('input', (e) => {
    if (targetKbInput) targetKbInput.value = e.target.value;
  });
  targetKbInput?.addEventListener('input', (e) => {
    if (targetKbSlider) targetKbSlider.value = e.target.value;
  });

  compressActionBtn?.addEventListener('click', compressImage);

  // Indian Exam Presets
  document.querySelectorAll('#compressor-view .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#compressor-view .preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const kb = chip.dataset.kb;
      if (targetKbInput && targetKbSlider) {
        targetKbInput.value = kb;
        targetKbSlider.value = kb;
        if (originalImageObj) compressImage();
      }
    });
  });

  // Download Handler - Blob to DataURL for guaranteed file-manager download
  function triggerDownload(blob, fileName) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const a = document.createElement('a');
      a.href = reader.result; // base64 data URL — always triggers save dialog
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      // Small timeout to allow browser to register the click before cleanup
      setTimeout(() => {
        document.body.removeChild(a);
      }, 200);
    };
    reader.readAsDataURL(blob);
  }

  downloadBtn?.addEventListener('click', () => {
    if (!compressedBlob || !currentFile) return;
    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const fileName = `studentkit-${baseName}-${targetKbInput.value}kb.jpg`;
    triggerDownload(compressedBlob, fileName);
    showToast?.('File saved to your Downloads folder! 🎉', 'success');
  });
}
