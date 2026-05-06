const MAX_OUTPUT_PIXELS = 160000000;
const MAX_CANVAS_SIDE = 16384;
const PREVIEW_MAX_PIXELS = 2200000;
const DETAIL_EXPORT_MAX_PIXELS = 36000000;
const DETAIL_TILE_ROWS = 128;
const LOCALE_STORAGE_KEY = "lumaScaleLocale";
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2];

const messages = {
  ko: {
    documentTitle: "LumaScale 사진 편집기",
    appSubtitle: "사진 편집기",
    open: "열기",
    export: "내보내기",
    controlsAria: "사진 편집 도구",
    dropTitle: "이미지 놓기",
    toolsAria: "편집 도구",
    cropTool: "자르기",
    upscaleTool: "업스케일",
    enhanceTool: "화질",
    filtersTool: "필터",
    exportTool: "내보내기",
    reset: "초기화",
    cropLeft: "왼쪽",
    cropTop: "위",
    cropRight: "오른쪽",
    cropBottom: "아래",
    outputSize: "출력 크기",
    scaleAria: "업스케일 배율",
    method: "방식",
    detailMode: "디테일 보정",
    smoothMode: "부드럽게",
    pixelMode: "픽셀 아트",
    fitMode: "비율 처리",
    coverMode: "채우기",
    containMode: "전체",
    stretchMode: "늘이기",
    photoEnhance: "화질 개선",
    enhanceAria: "화질 개선",
    enhanceOff: "끄기",
    enhanceAuto: "자동",
    enhanceVivid: "선명하게",
    enhanceStrength: "개선 강도",
    sharpness: "선명도",
    filterPreset: "필터",
    filterNone: "없음",
    filterWarm: "따뜻하게",
    filterCool: "차갑게",
    filterMono: "흑백",
    filterCinematic: "시네마틱",
    filterStrength: "필터 강도",
    fileFormat: "파일 형식",
    quality: "품질",
    metadataAria: "이미지 정보",
    original: "원본",
    output: "출력",
    memory: "예상 메모리",
    previewAria: "이미지 미리보기",
    viewModeAria: "미리보기 모드",
    compare: "비교",
    result: "결과",
    base: "원본",
    zoomAria: "확대",
    fit: "맞춤",
    zoomOut: "축소",
    zoomIn: "확대",
    emptyTitle: "이미지를 선택하세요",
    emptyHint: "왼쪽 패널에서 파일을 열 수 있습니다",
    comparePosition: "비교 위치",
    noFile: "파일 없음",
    chooseImage: "이미지 파일을 선택해주세요",
    opening: "이미지 여는 중",
    cannotOpen: "이미지를 열 수 없습니다",
    lowerSize: "출력 크기를 낮춰주세요",
    previewing: "미리보기 처리 중",
    done: "완료",
    fitting: "맞춤",
    exporting: "{dimensions} 내보내는 중",
    detailProgress: "선명도 보정 {progress}%",
    fastDetail: "대형 파일 빠른 디테일 처리 중",
    creatingFile: "파일 만드는 중",
    exportDone: "내보내기 완료",
    exportFailed: "내보내기에 실패했습니다",
    waiting: "대기 중",
  },
  en: {
    documentTitle: "LumaScale Photo Editor",
    appSubtitle: "Photo Editor",
    open: "Open",
    export: "Export",
    controlsAria: "Photo editing tools",
    dropTitle: "Drop Image",
    toolsAria: "Editing tools",
    cropTool: "Crop",
    upscaleTool: "Upscale",
    enhanceTool: "Quality",
    filtersTool: "Filters",
    exportTool: "Export",
    reset: "Reset",
    cropLeft: "Left",
    cropTop: "Top",
    cropRight: "Right",
    cropBottom: "Bottom",
    outputSize: "Output Size",
    scaleAria: "Upscale ratio",
    method: "Method",
    detailMode: "Detail Boost",
    smoothMode: "Smooth",
    pixelMode: "Pixel Art",
    fitMode: "Fit Mode",
    coverMode: "Cover",
    containMode: "Contain",
    stretchMode: "Stretch",
    photoEnhance: "Quality Boost",
    enhanceAria: "Quality enhancement",
    enhanceOff: "Off",
    enhanceAuto: "Auto",
    enhanceVivid: "Vivid",
    enhanceStrength: "Boost Strength",
    sharpness: "Sharpness",
    filterPreset: "Filter",
    filterNone: "None",
    filterWarm: "Warm",
    filterCool: "Cool",
    filterMono: "Mono",
    filterCinematic: "Cinematic",
    filterStrength: "Filter Strength",
    fileFormat: "File Format",
    quality: "Quality",
    metadataAria: "Image information",
    original: "Original",
    output: "Output",
    memory: "Est. Memory",
    previewAria: "Image preview",
    viewModeAria: "Preview mode",
    compare: "Compare",
    result: "Result",
    base: "Original",
    zoomAria: "Zoom",
    fit: "Fit",
    zoomOut: "Zoom Out",
    zoomIn: "Zoom In",
    emptyTitle: "Choose an image",
    emptyHint: "Open a file from the left panel",
    comparePosition: "Compare position",
    noFile: "No file",
    chooseImage: "Please choose an image file",
    opening: "Opening image",
    cannotOpen: "Could not open the image",
    lowerSize: "Please lower the output size",
    previewing: "Rendering preview",
    done: "Done",
    fitting: "Fit",
    exporting: "Exporting {dimensions}",
    detailProgress: "Sharpening {progress}%",
    fastDetail: "Applying fast detail pass for large file",
    creatingFile: "Creating file",
    exportDone: "Export complete",
    exportFailed: "Export failed",
    waiting: "Ready",
  },
};

const state = {
  file: null,
  image: null,
  activeTool: "crop",
  sizeMode: "scale",
  scale: 2,
  customWidth: 13500,
  customHeight: 10500,
  crop: { left: 0, top: 0, right: 0, bottom: 0 },
  method: "detail",
  fitMode: "cover",
  enhanceMode: "off",
  enhanceStrength: 55,
  filterPreset: "none",
  filterStrength: 60,
  sharpness: 42,
  format: "image/png",
  quality: 0.92,
  locale: localStorage.getItem(LOCALE_STORAGE_KEY) || "ko",
  view: "compare",
  zoom: "fit",
  ready: false,
  statusKey: "waiting",
  statusParams: {},
  renderId: 0,
};

const dom = {
  fileInput: document.querySelector("#fileInput"),
  openButton: document.querySelector("#openButton"),
  downloadButton: document.querySelector("#downloadButton"),
  languageButtons: document.querySelectorAll("[data-locale]"),
  toolButtons: document.querySelectorAll("[data-tool]"),
  toolPanels: document.querySelectorAll("[data-tool-panel]"),
  dropZone: document.querySelector("#dropZone"),
  scaleOutput: document.querySelector("#scaleOutput"),
  widthInput: document.querySelector("#widthInput"),
  heightInput: document.querySelector("#heightInput"),
  resetCropButton: document.querySelector("#resetCropButton"),
  cropXRange: document.querySelector("#cropXRange"),
  cropYRange: document.querySelector("#cropYRange"),
  cropWidthRange: document.querySelector("#cropWidthRange"),
  cropHeightRange: document.querySelector("#cropHeightRange"),
  cropXOutput: document.querySelector("#cropXOutput"),
  cropYOutput: document.querySelector("#cropYOutput"),
  cropWidthOutput: document.querySelector("#cropWidthOutput"),
  cropHeightOutput: document.querySelector("#cropHeightOutput"),
  methodSelect: document.querySelector("#methodSelect"),
  fitModeSelect: document.querySelector("#fitModeSelect"),
  enhanceOutput: document.querySelector("#enhanceOutput"),
  enhanceStrengthRange: document.querySelector("#enhanceStrengthRange"),
  enhanceStrengthOutput: document.querySelector("#enhanceStrengthOutput"),
  filterSelect: document.querySelector("#filterSelect"),
  filterStrengthRange: document.querySelector("#filterStrengthRange"),
  filterStrengthOutput: document.querySelector("#filterStrengthOutput"),
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

function translate(key, params = {}) {
  const template = messages[state.locale]?.[key] || messages.ko[key] || key;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function setLocale(locale) {
  state.locale = messages[locale] ? locale : "ko";
  localStorage.setItem(LOCALE_STORAGE_KEY, state.locale);
  document.documentElement.lang = state.locale;
  document.title = translate("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", translate(element.dataset.i18nTitle));
  });

  dom.languageButtons.forEach((button) => {
    const isActive = button.dataset.locale === state.locale;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (!state.file) {
    dom.fileName.textContent = translate("noFile");
  }
  updateCropControls();
  updateEnhanceControls();
  updateFilterControls();

  if (state.statusKey) {
    setStatusKey(state.statusKey, state.statusParams);
  }
}

function formatDimensions(width, height) {
  return `${width.toLocaleString()} x ${height.toLocaleString()}`;
}

function formatMemory(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function setStatusKey(key, params = {}) {
  state.statusKey = key;
  state.statusParams = params;
  dom.statusText.textContent = translate(key, params);
}

function setStatus(message) {
  state.statusKey = "";
  state.statusParams = {};
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
  const source = getEffectiveSourceSize();
  const width =
    state.sizeMode === "custom" ? state.customWidth : Math.round(source.width * state.scale);
  const height =
    state.sizeMode === "custom" ? state.customHeight : Math.round(source.height * state.scale);
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

function clampPercent(value, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizeCrop() {
  state.crop.left = clampPercent(state.crop.left, 0, 99);
  state.crop.top = clampPercent(state.crop.top, 0, 99);
  state.crop.right = clampPercent(state.crop.right, 0, 99 - state.crop.left);
  state.crop.bottom = clampPercent(state.crop.bottom, 0, 99 - state.crop.top);
}

function getSourceCropRect(source = state.image) {
  if (!source) return { x: 0, y: 0, width: 0, height: 0 };
  normalizeCrop();
  const widthPercent = 100 - state.crop.left - state.crop.right;
  const heightPercent = 100 - state.crop.top - state.crop.bottom;
  const width = Math.max(1, source.width * (widthPercent / 100));
  const height = Math.max(1, source.height * (heightPercent / 100));
  const x = Math.min(source.width - width, source.width * (state.crop.left / 100));
  const y = Math.min(source.height - height, source.height * (state.crop.top / 100));
  return { x, y, width, height };
}

function getEffectiveSourceSize() {
  const rect = getSourceCropRect();
  return { width: rect.width, height: rect.height };
}

function updateCropControls() {
  normalizeCrop();
  dom.cropXRange.max = String(99 - state.crop.right);
  dom.cropYRange.max = String(99 - state.crop.bottom);
  dom.cropWidthRange.max = String(99 - state.crop.left);
  dom.cropHeightRange.max = String(99 - state.crop.top);
  dom.cropXRange.value = String(state.crop.left);
  dom.cropYRange.value = String(state.crop.top);
  dom.cropWidthRange.value = String(state.crop.right);
  dom.cropHeightRange.value = String(state.crop.bottom);
  dom.cropXOutput.textContent = `${state.crop.left}%`;
  dom.cropYOutput.textContent = `${state.crop.top}%`;
  dom.cropWidthOutput.textContent = `${state.crop.right}%`;
  dom.cropHeightOutput.textContent = `${state.crop.bottom}%`;
}

function setCropValue(key, value) {
  state.crop[key] = clampPercent(value, 0, 99);
  updateCropControls();
  updateStats();
  scheduleRender();
}

function resetCrop() {
  state.crop = { left: 0, top: 0, right: 0, bottom: 0 };
  updateCropControls();
  updateStats();
  scheduleRender();
}

function getEnhancementFilter() {
  if (state.enhanceMode === "off" || state.enhanceStrength <= 0) return "none";

  const amount = state.enhanceStrength / 100;
  const profiles = {
    auto: {
      brightness: 1 + amount * 0.025,
      contrast: 1 + amount * 0.16,
      saturate: 1 + amount * 0.12,
    },
    vivid: {
      brightness: 1 + amount * 0.015,
      contrast: 1 + amount * 0.24,
      saturate: 1 + amount * 0.28,
    },
  };
  const profile = profiles[state.enhanceMode] || profiles.auto;

  return [
    `brightness(${profile.brightness.toFixed(3)})`,
    `contrast(${profile.contrast.toFixed(3)})`,
    `saturate(${profile.saturate.toFixed(3)})`,
  ].join(" ");
}

function getFilterEffect() {
  if (state.filterPreset === "none" || state.filterStrength <= 0) return "none";

  const amount = state.filterStrength / 100;
  const filters = {
    warm: [
      `sepia(${(amount * 0.22).toFixed(3)})`,
      `saturate(${(1 + amount * 0.24).toFixed(3)})`,
      `hue-rotate(${(-7 * amount).toFixed(2)}deg)`,
    ],
    cool: [
      `saturate(${(1 + amount * 0.12).toFixed(3)})`,
      `contrast(${(1 + amount * 0.06).toFixed(3)})`,
      `hue-rotate(${(10 * amount).toFixed(2)}deg)`,
    ],
    mono: [`grayscale(${amount.toFixed(3)})`, `contrast(${(1 + amount * 0.12).toFixed(3)})`],
    cinematic: [
      `contrast(${(1 + amount * 0.22).toFixed(3)})`,
      `saturate(${(1 - amount * 0.08).toFixed(3)})`,
      `sepia(${(amount * 0.1).toFixed(3)})`,
      `brightness(${(1 - amount * 0.025).toFixed(3)})`,
    ],
  };

  return (filters[state.filterPreset] || []).join(" ") || "none";
}

function getVisualFilter() {
  const filters = [getEnhancementFilter(), getFilterEffect()].filter((filter) => filter !== "none");
  return filters.length ? filters.join(" ") : "none";
}

function updateEnhanceControls() {
  dom.enhanceOutput.textContent = translate(
    state.enhanceMode === "off"
      ? "enhanceOff"
      : state.enhanceMode === "vivid"
        ? "enhanceVivid"
        : "enhanceAuto",
  );
  dom.enhanceStrengthOutput.textContent = `${state.enhanceStrength}%`;
  dom.enhanceStrengthRange.disabled = state.enhanceMode === "off";

  document.querySelectorAll("[data-enhance]").forEach((button) => {
    button.classList.toggle("active", button.dataset.enhance === state.enhanceMode);
  });
}

function updateFilterControls() {
  dom.filterSelect.value = state.filterPreset;
  dom.filterStrengthOutput.textContent = `${state.filterStrength}%`;
  dom.filterStrengthRange.disabled = state.filterPreset === "none";
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
    setStatusKey("chooseImage");
    return;
  }

  setBusy(true);
  setStatusKey("opening");
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
    setStatusKey("cannotOpen");
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

function getDrawRect(source, width, height, fitMode, cropRect = null) {
  const area = cropRect || { x: 0, y: 0, width: source.width, height: source.height };

  if (fitMode === "stretch") {
    return {
      sx: area.x,
      sy: area.y,
      sw: area.width,
      sh: area.height,
      dx: 0,
      dy: 0,
      dw: width,
      dh: height,
    };
  }

  const sourceAspect = area.width / area.height;
  const targetAspect = width / height;

  if (fitMode === "contain") {
    const dw = sourceAspect > targetAspect ? width : height * sourceAspect;
    const dh = sourceAspect > targetAspect ? width / sourceAspect : height;
    return {
      sx: area.x,
      sy: area.y,
      sw: area.width,
      sh: area.height,
      dx: (width - dw) / 2,
      dy: (height - dh) / 2,
      dw,
      dh,
    };
  }

  const sw = sourceAspect > targetAspect ? area.height * targetAspect : area.width;
  const sh = sourceAspect > targetAspect ? area.height : area.width / targetAspect;
  return {
    sx: area.x + (area.width - sw) / 2,
    sy: area.y + (area.height - sh) / 2,
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
  enhancementFilter = "none",
  cropRect = null,
) {
  const ctx = canvas.getContext("2d", { willReadFrequently });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = smoothing;
  ctx.imageSmoothingQuality = "high";
  const filters = [];
  if (enhancementFilter !== "none") filters.push(enhancementFilter);
  if (fastDetail) filters.push("contrast(1.035) saturate(1.015)");
  ctx.filter = filters.length ? filters.join(" ") : "none";
  const rect = getDrawRect(source, canvas.width, canvas.height, fitMode, cropRect);
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
  const cropRect = getSourceCropRect();
  const visualFilter = getVisualFilter();
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
    setStatusKey("lowerSize");
    return;
  }

  setBusy(true);
  setStatusKey("previewing");
  await waitFrame();
  if (renderId !== state.renderId) return;

  dom.baseCanvas.width = preview.width;
  dom.baseCanvas.height = preview.height;
  dom.resultCanvas.width = preview.width;
  dom.resultCanvas.height = preview.height;

  drawScaled(state.image, dom.baseCanvas, true, state.fitMode, true, false, "none", cropRect);
  drawScaled(
    state.image,
    dom.resultCanvas,
    state.method !== "pixel",
    state.fitMode,
    true,
    false,
    visualFilter,
    cropRect,
  );

  if (state.method === "detail") {
    await waitFrame();
    if (renderId !== state.renderId) return;
    applyUnsharpMask(dom.resultCanvas, state.sharpness);
  }

  updateFrameSize();
  setView(state.view);
  state.ready = true;
  setStatusKey("done");
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

function setEnhanceMode(mode) {
  state.enhanceMode = ["off", "auto", "vivid"].includes(mode) ? mode : "off";
  updateEnhanceControls();
  scheduleRender();
}

function setFilterPreset(preset) {
  state.filterPreset = ["none", "warm", "cool", "mono", "cinematic"].includes(preset)
    ? preset
    : "none";
  updateFilterControls();
  scheduleRender();
}

function setActiveTool(tool) {
  state.activeTool = ["crop", "upscale", "enhance", "filters", "export"].includes(tool)
    ? tool
    : "crop";

  dom.toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === state.activeTool;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  dom.toolPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolPanel === state.activeTool);
  });
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
  if (state.zoom === "fit") {
    setStatusKey("fitting");
  } else {
    setStatus(`${Math.round(state.zoom * 100)}%`);
  }
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
  const cropRect = getSourceCropRect();
  const visualFilter = getVisualFilter();
  const exportCanvas = document.createElement("canvas");

  setBusy(true);
  setStatusKey("exporting", { dimensions: formatDimensions(output.width, output.height) });
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
      visualFilter,
      cropRect,
    );

    if (canUseTiledDetail) {
      await applyUnsharpMaskTiled(exportCanvas, state.sharpness, (progress) => {
        setStatusKey("detailProgress", { progress: Math.round(progress * 100) });
      });
    } else if (state.method === "detail") {
      setStatusKey("fastDetail");
      await waitFrame();
    }

    setStatusKey("creatingFile");
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
    setStatusKey("exportDone");
  } catch (error) {
    console.error(error);
    setStatusKey("exportFailed");
  } finally {
    exportCanvas.width = 0;
    exportCanvas.height = 0;
    setBusy(false);
  }
}

dom.openButton.addEventListener("click", () => dom.fileInput.click());
dom.languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLocale(button.dataset.locale));
});
dom.toolButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTool(button.dataset.tool));
});
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

dom.resetCropButton.addEventListener("click", resetCrop);
dom.cropXRange.addEventListener("input", (event) => setCropValue("left", event.target.value));
dom.cropYRange.addEventListener("input", (event) => setCropValue("top", event.target.value));
dom.cropWidthRange.addEventListener("input", (event) =>
  setCropValue("right", event.target.value),
);
dom.cropHeightRange.addEventListener("input", (event) =>
  setCropValue("bottom", event.target.value),
);

dom.methodSelect.addEventListener("change", (event) => {
  state.method = event.target.value;
  dom.sharpnessRange.disabled = state.method !== "detail";
  scheduleRender();
});

dom.fitModeSelect.addEventListener("change", (event) => {
  state.fitMode = event.target.value;
  scheduleRender();
});

document.querySelectorAll("[data-enhance]").forEach((button) => {
  button.addEventListener("click", () => setEnhanceMode(button.dataset.enhance));
});

dom.enhanceStrengthRange.addEventListener("input", (event) => {
  state.enhanceStrength = Number(event.target.value);
  updateEnhanceControls();
  scheduleRender();
});

dom.filterSelect.addEventListener("change", (event) => setFilterPreset(event.target.value));
dom.filterStrengthRange.addEventListener("input", (event) => {
  state.filterStrength = Number(event.target.value);
  updateFilterControls();
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
  setStatusKey("fitting");
});
dom.zoomInButton.addEventListener("click", () => changeZoom(1));
dom.zoomOutButton.addEventListener("click", () => changeZoom(-1));

window.addEventListener("resize", updateFrameSize);
updateSplit(dom.splitRange.value);
setActiveTool(state.activeTool);
updateCropControls();
syncSizeControls();
updateStats();
setLocale(state.locale);
updateEnhanceControls();
updateFilterControls();
dom.qualityRange.disabled = state.format === "image/png";
