const MAX_OUTPUT_PIXELS = 160000000;
const MAX_CANVAS_SIDE = 16384;
const PREVIEW_MAX_PIXELS = 2200000;
const DETAIL_EXPORT_MAX_PIXELS = 36000000;
const DETAIL_TILE_ROWS = 128;
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2];

const state = {
  file: null,
  image: null,
  sizeMode: "scale",
  scale: 2,
  customWidth: 13500,
  customHeight: 10500,
  method: "detail",
  fitMode: "cover",
  sharpness: 42,
  format: "image/png",
  quality: 0.92,
  view: "compare",
  zoom: "fit",
  ready: false,
  renderId: 0,
};

const dom = {
  fileInput: document.querySelector("#fileInput"),
  openButton: document.querySelector("#openButton"),
  downloadButton: document.querySelector("#downloadButton"),
  dropZone: document.querySelector("#dropZone"),
  scaleOutput: document.querySelector("#scaleOutput"),
  widthInput: document.querySelector("#widthInput"),
  heightInput: document.querySelector("#heightInput"),
  methodSelect: document.querySelector("#methodSelect"),
  fitModeSelect: document.querySelector("#fitModeSelect"),
  sharpnessRange: document.querySelector("#sharpnessRange"),
  sharpnessOutput: document.querySelector("#sharpnessOutput"),
  formatSelect: document.querySelector("#formatSelect"),
  qualityRange: document.querySelector("#qualityRange"),
  qualityOutput: document.querySelector("#qualityOutput"),
  originalSize: document.querySelector("#originalSize"),
  outputSize: document.querySelector("#outputSize"),
  memorySize: document.querySelector("#memorySize"),
  statusText: document.querySelector("#statusText"),
  fileName: document.querySelector("#fileName"),
  stage: document.querySelector("#stage"),
  emptyState: document.querySelector("#emptyState"),
  compareFrame: document.querySelector("#compareFrame"),
  baseCanvas: document.querySelector("#baseCanvas"),
  resultCanvas: document.querySelector("#resultCanvas"),
  resultClip: document.querySelector("#resultClip"),
  splitLine: document.querySelector("#splitLine"),
  splitRange: document.querySelector("#splitRange"),
  fitButton: document.querySelector("#fitButton"),
  zoomInButton: document.querySelector("#zoomInButton"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
};

const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function formatDimensions(width, height) {
  return `${width.toLocaleString()} x ${height.toLocaleString()}`;
}

function formatMemory(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function setStatus(message) {
  dom.statusText.textContent = message;
}

function setBusy(isBusy) {
  dom.downloadButton.disabled = isBusy || !state.ready;
  dom.openButton.disabled = isBusy;
  dom.dropZone.toggleAttribute("aria-disabled", isBusy);
}

function clampDimension(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(1, Math.min(MAX_CANVAS_SIDE, Math.round(number)));
}

function getOutputSize() {
  if (!state.image) return { width: 0, height: 0, pixels: 0 };
  const width =
    state.sizeMode === "custom" ? state.customWidth : state.image.width * state.scale;
  const height =
    state.sizeMode === "custom" ? state.customHeight : state.image.height * state.scale;
  return { width, height, pixels: width * height };
}

function getPreviewSize(output) {
  if (!output.pixels) return { width: 0, height: 0 };

  const ratio = Math.min(1, Math.sqrt(PREVIEW_MAX_PIXELS / output.pixels));
  return {
    width: Math.max(1, Math.round(output.width * ratio)),
    height: Math.max(1, Math.round(output.height * ratio)),
  };
}

function syncSizeControls() {
  const output = getOutputSize();
  dom.scaleOutput.textContent =
    state.sizeMode === "scale"
      ? `${state.scale}x`
      : `${state.customWidth.toLocaleString()} x ${state.customHeight.toLocaleString()}`;

  document.querySelectorAll("[data-scale]").forEach((button) => {
    button.classList.toggle(
      "active",
      state.sizeMode === "scale" && Number(button.dataset.scale) === state.scale,
    );
  });

  document.querySelectorAll("[data-output-width]").forEach((button) => {
    button.classList.toggle(
      "active",
      state.sizeMode === "custom" &&
        Number(button.dataset.outputWidth) === state.customWidth &&
        Number(button.dataset.outputHeight) === state.customHeight,
    );
  });

  dom.widthInput.value =
    state.sizeMode === "custom" || output.width ? String(output.width || state.customWidth) : "";
  dom.heightInput.value =
    state.sizeMode === "custom" || output.height ? String(output.height || state.customHeight) : "";
}

function updateStats() {
  if (!state.image) {
    dom.originalSize.textContent = "-";
    dom.outputSize.textContent = "-";
    dom.memorySize.textContent = "-";
    return;
  }

  const output = getOutputSize();
  syncSizeControls();
  dom.originalSize.textContent = formatDimensions(state.image.width, state.image.height);
  dom.outputSize.textContent = formatDimensions(output.width, output.height);
  dom.memorySize.textContent = `${formatMemory(output.pixels * 4)}+`;
}

async function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("이미지 파일을 선택해주세요");
    return;
  }

  setBusy(true);
  setStatus("이미지 여는 중");
  dom.fileName.textContent = file.name;

  try {
    const image = await createBitmap(file);
    if (state.image && "close" in state.image) state.image.close();
    state.file = file;
    state.image = image;
    state.ready = false;
    dom.emptyState.classList.add("hidden");
    dom.compareFrame.classList.remove("hidden");
    state.zoom = "fit";
    updateStats();
    await render();
  } catch (error) {
    console.error(error);
    setStatus("이미지를 열 수 없습니다");
  } finally {
    setBusy(false);
  }
}

async function createBitmap(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (error) {
      console.warn("createImageBitmap failed, falling back to Image", error);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getDrawRect(source, width, height, fitMode) {
  if (fitMode === "stretch") {
    return {
      sx: 0,
      sy: 0,
      sw: source.width,
      sh: source.height,
      dx: 0,
      dy: 0,
      dw: width,
      dh: height,
    };
  }

  const sourceAspect = source.width / source.height;
  const targetAspect = width / height;

  if (fitMode === "contain") {
    const dw = sourceAspect > targetAspect ? width : height * sourceAspect;
    const dh = sourceAspect > targetAspect ? width / sourceAspect : height;
    return {
      sx: 0,
      sy: 0,
      sw: source.width,
      sh: source.height,
      dx: (width - dw) / 2,
      dy: (height - dh) / 2,
      dw,
      dh,
    };
  }

  const sw = sourceAspect > targetAspect ? source.height * targetAspect : source.width;
  const sh = sourceAspect > targetAspect ? source.height : source.width / targetAspect;
  return {
    sx: (source.width - sw) / 2,
    sy: (source.height - sh) / 2,
    sw,
    sh,
    dx: 0,
    dy: 0,
    dw: width,
    dh: height,
  };
}

function drawScaled(
  source,
  canvas,
  smoothing,
  fitMode,
  willReadFrequently = false,
  fastDetail = false,
) {
  const ctx = canvas.getContext("2d", { willReadFrequently });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = smoothing;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = fastDetail ? "contrast(1.035) saturate(1.015)" : "none";
  const rect = getDrawRect(source, canvas.width, canvas.height, fitMode);
  ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh);
  ctx.filter = "none";
}

function applyUnsharpMask(canvas, amountPercent) {
  const amount = amountPercent / 100;
  if (amount <= 0) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const source = imageData.data;
  const blurred = new Uint8ClampedArray(source.length);
  const rowStride = width * 4;

  blurred.set(source);

  for (let y = 1; y < height - 1; y += 1) {
    const row = y * rowStride;
    for (let x = 1; x < width - 1; x += 1) {
      const i = row + x * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const c = i + channel;
        blurred[c] =
          (source[c - rowStride - 4] +
            source[c - rowStride] +
            source[c - rowStride + 4] +
            source[c - 4] +
            source[c] +
            source[c + 4] +
            source[c + rowStride - 4] +
            source[c + rowStride] +
            source[c + rowStride + 4]) /
          9;
      }
    }
  }

  const threshold = 2;
  for (let i = 0; i < source.length; i += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      const c = i + channel;
      const diff = source[c] - blurred[c];
      if (Math.abs(diff) > threshold) {
        source[c] = Math.max(0, Math.min(255, source[c] + diff * amount));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

async function applyUnsharpMaskTiled(canvas, amountPercent, onProgress) {
  const amount = amountPercent / 100;
  if (amount <= 0) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const threshold = 2;

  for (let y = 0; y < height; y += DETAIL_TILE_ROWS) {
    const targetHeight = Math.min(DETAIL_TILE_ROWS, height - y);
    const readY = Math.max(0, y - 1);
    const readBottom = Math.min(height, y + targetHeight + 1);
    const readHeight = readBottom - readY;
    const targetOffsetY = y - readY;
    const imageData = ctx.getImageData(0, readY, width, readHeight);
    const data = imageData.data;
    const source = new Uint8ClampedArray(data);
    const rowStride = width * 4;

    for (let localY = targetOffsetY; localY < targetOffsetY + targetHeight; localY += 1) {
      const globalY = readY + localY;
      if (globalY === 0 || globalY === height - 1) continue;

      const row = localY * rowStride;
      for (let x = 1; x < width - 1; x += 1) {
        const i = row + x * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          const c = i + channel;
          const blurred =
            (source[c - rowStride - 4] +
              source[c - rowStride] +
              source[c - rowStride + 4] +
              source[c - 4] +
              source[c] +
              source[c + 4] +
              source[c + rowStride - 4] +
              source[c + rowStride] +
              source[c + rowStride + 4]) /
            9;
          const diff = source[c] - blurred;
          if (Math.abs(diff) > threshold) {
            data[c] = Math.max(0, Math.min(255, source[c] + diff * amount));
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, readY, 0, targetOffsetY, width, targetHeight);
    if (onProgress) onProgress((y + targetHeight) / height);
    await waitFrame();
  }
}

async function render() {
  if (!state.image) return;

  const renderId = (state.renderId += 1);
  const output = getOutputSize();
  const preview = getPreviewSize(output);
  updateStats();

  if (
    !output.width ||
    !output.height ||
    output.width > MAX_CANVAS_SIDE ||
    output.height > MAX_CANVAS_SIDE ||
    output.pixels > MAX_OUTPUT_PIXELS
  ) {
    state.ready = false;
    dom.downloadButton.disabled = true;
    setStatus("출력 크기를 낮춰주세요");
    return;
  }

  setBusy(true);
  setStatus("미리보기 처리 중");
  await waitFrame();
  if (renderId !== state.renderId) return;

  dom.baseCanvas.width = preview.width;
  dom.baseCanvas.height = preview.height;
  dom.resultCanvas.width = preview.width;
  dom.resultCanvas.height = preview.height;

  drawScaled(state.image, dom.baseCanvas, true, state.fitMode, true);
  drawScaled(state.image, dom.resultCanvas, state.method !== "pixel", state.fitMode, true);

  if (state.method === "detail") {
    await waitFrame();
    if (renderId !== state.renderId) return;
    applyUnsharpMask(dom.resultCanvas, state.sharpness);
  }

  updateFrameSize();
  setView(state.view);
  state.ready = true;
  setStatus("완료");
  setBusy(false);
}

function scheduleRender() {
  window.clearTimeout(scheduleRender.timeoutId);
  scheduleRender.timeoutId = window.setTimeout(render, 120);
}

function setScale(scale) {
  state.sizeMode = "scale";
  state.scale = scale;
  syncSizeControls();
  updateStats();
  scheduleRender();
}

function setCustomSize(width, height) {
  state.sizeMode = "custom";
  state.customWidth = clampDimension(width);
  state.customHeight = clampDimension(height);
  syncSizeControls();
  updateStats();
  scheduleRender();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  dom.compareFrame.classList.toggle("result-only", view === "result");
  dom.compareFrame.classList.toggle("base-only", view === "base");
}

function updateSplit(value) {
  dom.compareFrame.style.setProperty("--split", `${value}%`);
  dom.compareFrame.style.setProperty("--split-number", value);
}

function updateFrameSize() {
  if (!state.image) return;

  const output = getOutputSize();
  const stageRect = dom.stage.getBoundingClientRect();
  const maxWidth = Math.max(220, stageRect.width - 36);
  const maxHeight = Math.max(220, stageRect.height - 36);
  const aspect = output.width / output.height;
  let width;
  let height;

  if (state.zoom === "fit") {
    width = Math.min(maxWidth, maxHeight * aspect);
    height = width / aspect;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspect;
    }
  } else {
    width = output.width * state.zoom;
    height = output.height * state.zoom;
  }

  dom.compareFrame.style.width = `${Math.max(180, width)}px`;
  dom.compareFrame.style.height = `${Math.max(180, height)}px`;
}

function changeZoom(direction) {
  if (!state.image) return;

  if (state.zoom === "fit") {
    state.zoom = direction > 0 ? 0.75 : 0.5;
  } else {
    const index = ZOOM_STEPS.findIndex((step) => step === state.zoom);
    const fallbackIndex = ZOOM_STEPS.findIndex((step) => step >= state.zoom);
    const currentIndex = index >= 0 ? index : Math.max(0, fallbackIndex);
    const nextIndex = Math.max(0, Math.min(ZOOM_STEPS.length - 1, currentIndex + direction));
    state.zoom = ZOOM_STEPS[nextIndex];
  }

  updateFrameSize();
  setStatus(state.zoom === "fit" ? "맞춤" : `${Math.round(state.zoom * 100)}%`);
}

function getExtension(mimeType) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function downloadResult() {
  if (!state.image) return;

  const extension = getExtension(state.format);
  const baseName = state.file?.name?.replace(/\.[^.]+$/, "") || "upscaled";
  const quality = state.format === "image/png" ? undefined : state.quality;
  const output = getOutputSize();
  const exportCanvas = document.createElement("canvas");

  setBusy(true);
  setStatus(`${formatDimensions(output.width, output.height)} 내보내는 중`);
  await waitFrame();

  try {
    const canUseTiledDetail =
      state.method === "detail" && output.pixels <= DETAIL_EXPORT_MAX_PIXELS;

    exportCanvas.width = output.width;
    exportCanvas.height = output.height;
    drawScaled(
      state.image,
      exportCanvas,
      state.method !== "pixel",
      state.fitMode,
      canUseTiledDetail,
      state.method === "detail" && !canUseTiledDetail,
    );

    if (canUseTiledDetail) {
      await applyUnsharpMaskTiled(exportCanvas, state.sharpness, (progress) => {
        setStatus(`선명도 보정 ${Math.round(progress * 100)}%`);
      });
    } else if (state.method === "detail") {
      setStatus("대형 파일 빠른 디테일 처리 중");
      await waitFrame();
    }

    setStatus("파일 만드는 중");
    const blob = await canvasToBlob(exportCanvas, state.format, quality);
    if (!blob) throw new Error("Canvas export failed");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sizeLabel =
      state.sizeMode === "custom"
        ? `${output.width}x${output.height}`
        : `${state.scale}x`;
    link.href = url;
    link.download = `${baseName}-${sizeLabel}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("내보내기 완료");
  } catch (error) {
    console.error(error);
    setStatus("내보내기에 실패했습니다");
  } finally {
    exportCanvas.width = 0;
    exportCanvas.height = 0;
    setBusy(false);
  }
}

dom.openButton.addEventListener("click", () => dom.fileInput.click());
dom.fileInput.addEventListener("change", (event) => {
  loadFile(event.target.files[0]);
  event.target.value = "";
});
dom.downloadButton.addEventListener("click", downloadResult);

dom.dropZone.addEventListener("click", () => dom.fileInput.click());
dom.dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    dom.fileInput.click();
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  dom.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dom.dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dom.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dom.dropZone.classList.remove("dragover");
  });
});

dom.dropZone.addEventListener("drop", (event) => {
  loadFile(event.dataTransfer.files[0]);
});

document.querySelectorAll("[data-scale]").forEach((button) => {
  button.addEventListener("click", () => setScale(Number(button.dataset.scale)));
});

document.querySelectorAll("[data-output-width]").forEach((button) => {
  button.addEventListener("click", () => {
    setCustomSize(Number(button.dataset.outputWidth), Number(button.dataset.outputHeight));
  });
});

dom.widthInput.addEventListener("input", (event) => {
  setCustomSize(event.target.value, dom.heightInput.value || state.customHeight);
});

dom.heightInput.addEventListener("input", (event) => {
  setCustomSize(dom.widthInput.value || state.customWidth, event.target.value);
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

dom.methodSelect.addEventListener("change", (event) => {
  state.method = event.target.value;
  dom.sharpnessRange.disabled = state.method !== "detail";
  scheduleRender();
});

dom.fitModeSelect.addEventListener("change", (event) => {
  state.fitMode = event.target.value;
  scheduleRender();
});

dom.sharpnessRange.addEventListener("input", (event) => {
  state.sharpness = Number(event.target.value);
  dom.sharpnessOutput.textContent = state.sharpness;
  scheduleRender();
});

dom.formatSelect.addEventListener("change", (event) => {
  state.format = event.target.value;
  dom.qualityRange.disabled = state.format === "image/png";
});

dom.qualityRange.addEventListener("input", (event) => {
  state.quality = Number(event.target.value) / 100;
  dom.qualityOutput.textContent = `${event.target.value}%`;
});

dom.splitRange.addEventListener("input", (event) => updateSplit(event.target.value));
dom.fitButton.addEventListener("click", () => {
  state.zoom = "fit";
  updateFrameSize();
  setStatus("맞춤");
});
dom.zoomInButton.addEventListener("click", () => changeZoom(1));
dom.zoomOutButton.addEventListener("click", () => changeZoom(-1));

window.addEventListener("resize", updateFrameSize);
updateSplit(dom.splitRange.value);
syncSizeControls();
updateStats();
dom.qualityRange.disabled = state.format === "image/png";
