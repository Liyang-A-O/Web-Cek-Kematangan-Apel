// DOM Elements
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const cameraBtn = document.getElementById("cameraBtn");
const cameraInput = document.getElementById("cameraInput");
const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");
const detectBtn = document.getElementById("detectBtn");
const resetBtn = document.getElementById("resetBtn");
const backHomeBtn = document.getElementById("backHomeBtn");
const loadingSection = document.getElementById("loadingSection");
const resultsSection = document.getElementById("resultsSection");
const resultsContainer = document.getElementById("resultsContainer");
const errorSection = document.getElementById("errorSection");
const errorText = document.getElementById("errorText");

let selectedImage = null;
let currentStream = null;

// Event Listeners
uploadArea.addEventListener("click", () => fileInput.click());
uploadArea.addEventListener("dragover", handleDragOver);
uploadArea.addEventListener("dragleave", handleDragLeave);
uploadArea.addEventListener("drop", handleDrop);

fileInput.addEventListener("change", handleFileSelect);
cameraBtn.addEventListener("click", openCamera);
cameraInput.addEventListener("change", handleFileSelect);
detectBtn.addEventListener("click", detectRipeness);
resetBtn.addEventListener("click", resetUpload);
backHomeBtn.addEventListener("click", resetUpload);

// Drag and Drop Handlers
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove("drag-over");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      loadImage(file);
    } else {
      showError("Tolong pilih file gambar");
    }
  }
}

// File Selection Handler
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      loadImage(file);
    } else {
      showError("Tolong pilih file gambar");
    }
  }
}

async function openCamera() {
  if (currentStream) return;

  try {
    cameraBtn.innerText = "Membuka kamera...";
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    currentStream = stream;

    // Buat video element
    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.style.width = "100%";
    video.style.borderRadius = "10px";

    // Tombol capture
    const captureBtn = document.createElement("button");
    captureBtn.textContent = "📸 Ambil Foto";
    captureBtn.className = "btn btn-primary";
    captureBtn.style.marginTop = "10px";

    // Container kamera
    const cameraContainer = document.createElement("div");
    cameraContainer.appendChild(video);
    cameraContainer.appendChild(captureBtn);

    // Wrapper kamera
    let cameraWrapper = document.getElementById("cameraWrapper");

    if (!cameraWrapper) {
      cameraWrapper = document.createElement("div");
      cameraWrapper.id = "cameraWrapper";
      previewSection.appendChild(cameraWrapper);
    }

    cameraWrapper.innerHTML = "";
    cameraWrapper.appendChild(cameraContainer);

    uploadArea.style.display = "none";
    cameraBtn.style.display = "none";
    previewSection.style.display = "block";

    captureBtn.onclick = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      // Stop kamera
      stopCamera();

      // Convert ke file
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        loadImage(file);
      }, "image/jpeg");
    };
  } catch (err) {
    showError("Tidak bisa mengakses kamera: " + err.message);
    cameraBtn.innerText = "📷 Ambil dari Kamera";
  }
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
}

// Load and Display Image
function loadImage(file) {
  selectedImage = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    previewImage.src = e.target.result;
    uploadArea.style.display = "none";
    cameraBtn.style.display = "none";
    previewSection.style.display = "block";
    resultsSection.style.display = "none";
    errorSection.style.display = "none";
    
    // Show buttons during preview
    const buttonGroup = document.getElementById("buttonGroup");
    if (buttonGroup) {
      buttonGroup.style.display = "flex";
      buttonGroup.classList.add("show");
    }

    // hapus kamera kalau ada
    const cam = document.getElementById("cameraWrapper");
    if (cam) cam.innerHTML = "";
  };

  reader.readAsDataURL(file);
}

// Convert Image to Base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Detect Ripeness
async function detectRipeness() {
  if (!selectedImage) {
    showError("Tolong pilih gambar terlebih dahulu");
    return;
  }

  try {
    // Show loading
    previewSection.style.display = "none";
    loadingSection.style.display = "block";
    errorSection.style.display = "none";

    // Convert image to base64
    const imageBase64 = await imageToBase64(selectedImage);
    console.log("📸 Image converted to base64");

    // Send to server
    console.log("📤 Sending request to /api/detect...");
    const response = await fetch("/api/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response ok:", response.ok);

    const data = await response.json();

    console.log("📊 Response dari server:", data);
    console.log("✅ data.success:", data.success);
    console.log("🔍 data.detections:", data.detections);
    console.log("📋 Type of detections:", typeof data.detections);
    if (data.detections) {
      console.log("📊 Detections length:", data.detections.length);
    }

    if (!response.ok) {
      throw new Error(
        data.error || `Error ${response.status}: Gagal menganalisis gambar`,
      );
    }

    if (!data.success) {
      throw new Error(
        "Response success = false: " + (data.error || "Unknown error"),
      );
    }

    if (!data.detections) {
      throw new Error(
        "Tidak ada data detections di response. Response: " +
          JSON.stringify(data),
      );
    }

    if (!Array.isArray(data.detections)) {
      throw new Error("Detections bukan array: " + typeof data.detections);
    }

    // Process and display results
    console.log("✨ Displaying results...");
    displayResults(data.detections);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("❌ Stack:", error.stack);
    showError(error.message);
    previewSection.style.display = "block";
    loadingSection.style.display = "none";
  }
}

// Display Results
function displayResults(detections) {
  console.log("🎨 displayResults called with:", detections);

  loadingSection.style.display = "none";

  if (!detections || !Array.isArray(detections) || detections.length === 0) {
    console.warn("⚠️ Tidak ada detections atau array kosong");
    resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>Tidak ada apel terdeteksi di gambar. Silakan coba dengan gambar yang berbeda.</p>
            </div>
        `;
  } else {
    console.log("✅ Memproses", detections.length, "detections");

    // Find if any detection has output_image
    let outputImageHtml = "";
    let imageDisplayed = false;

    detections.forEach((det, index) => {
      if (det && det._has_output_image && det.image && !imageDisplayed) {
        imageDisplayed = true;
        const imageDataUrl =
          typeof det.image === "string" && !det.image.startsWith("data:")
            ? `data:image/jpeg;base64,${det.image}`
            : det.image;
        console.log(
          "📊 Image data URL length:",
          imageDataUrl.substring(0, 100),
        );
        outputImageHtml = `
                    <div class="output-image-section">
                        <img src="${imageDataUrl}" alt="Hasil Analisis" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;">
                    </div>
                `;
      }
    });

    // Create result cards - LANGSUNG per detection, jangan di-group
    let html = "";
    detections.forEach((det, index) => {
      console.log(`  Detection ${index}:`, det);

      const label = det.label || "Unknown";
      const confidence = det.confidence || 0;
      const confidencePercent = (confidence * 100).toFixed(1);

      const statusClass = getStatusClass(label);
      const statusText = getStatusText(label);

      console.log(
        `  Card ${index} - Label: ${label}, Confidence: ${confidencePercent}%, Status: ${statusClass}`,
      );

      html += `
                <div class="ripeness-card ${statusClass}">
                    <div class="ripeness-header">
                        <span class="ripeness-label">${getEmojiForStatus(label)} ${label}</span>
                        <span class="ripeness-status status-${statusClass}">${statusText}</span>
                    </div>
                    <div class="ripeness-confidence">
                        <span class="confidence-label">Kepercayaan:</span>
                        <div class="confidence-bar-container">
                            <div class="confidence-bar" style="width: ${confidencePercent}%"></div>
                        </div>
                        <span class="confidence-value">${confidencePercent}%</span>
                    </div>
                    <div class="detection-info">
                        <small>${index + 1} dari ${detections.length} apel terdeteksi</small>
                    </div>
                </div>
            `;
    });

    console.log("📝 HTML generated:", html.substring(0, 100) + "...");
    resultsContainer.innerHTML = outputImageHtml + html;
  }

  resultsSection.style.display = "block";
  console.log("✨ Results section displayed");

  // Show results button group (kembali button)
  const resultsButtonGroup = document.querySelector(".results-button-group");
  if (resultsButtonGroup) {
    resultsButtonGroup.style.display = "flex";
  }

  // Show detect/reset buttons after detection
  const buttonGroup = document.getElementById("buttonGroup");
  if (buttonGroup) {
    buttonGroup.style.display = "flex";
    buttonGroup.classList.add("show");
  }
}

// Get Status Class
function getStatusClass(label) {
  const lowerLabel = label.toLowerCase();
  // Sesuai dengan class dari Roboflow: "Apel Matang" atau "Apel Tidak Matang"
  if (
    lowerLabel.includes("tidak") ||
    lowerLabel.includes("belum") ||
    lowerLabel.includes("unripe") ||
    lowerLabel.includes("green")
  ) {
    return "unripe";
  } else if (
    lowerLabel.includes("matang") ||
    lowerLabel.includes("ripe") ||
    lowerLabel.includes("masak")
  ) {
    return "ripe";
  }
  return "ripe"; // Default ke ripe jika tidak match
}

// Get Status Text
function getStatusText(label) {
  const lowerLabel = label.toLowerCase();
  if (
    lowerLabel.includes("tidak") ||
    lowerLabel.includes("belum") ||
    lowerLabel.includes("unripe") ||
    lowerLabel.includes("green")
  ) {
    return "Tidak Matang";
  } else if (
    lowerLabel.includes("matang") ||
    lowerLabel.includes("ripe") ||
    lowerLabel.includes("masak")
  ) {
    return "Matang";
  }
  return "Matang"; // Default
}

// Get Emoji for Status
function getEmojiForStatus(label) {
  const statusClass = getStatusClass(label);
  if (statusClass === "unripe") {
    return "🟢"; // Hijau = belum matang
  } else {
    return "🔴"; // Merah = matang
  }
}

// Show Error
function showError(message) {
  errorText.textContent = message;
  errorSection.style.display = "block";
}

// Reset Upload
function resetUpload() {
  // 🔥 Stop kamera kalau masih aktif
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }

  selectedImage = null;
  fileInput.value = "";
  cameraInput.value = "";
  previewImage.src = "";

  previewSection.style.display = "none";
  resultsSection.style.display = "none";
  errorSection.style.display = "none";
  loadingSection.style.display = "none";

  uploadArea.style.display = "block";
  cameraBtn.style.display = "block";

  // Hide buttons
  const buttonGroup = document.getElementById("buttonGroup");
  if (buttonGroup) {
    buttonGroup.style.display = "none";
    buttonGroup.classList.remove("show");
  }

  // Hide results button group
  const resultsButtonGroup = document.querySelector(".results-button-group");
  if (resultsButtonGroup) {
    resultsButtonGroup.style.display = "none";
  }

  // 🔥 FIX: balikin text tombol
  cameraBtn.innerText = "📷 Ambil Foto";

  uploadArea.classList.remove("drag-over");

  // Remove action buttons if exist
  const buttonGroups = document.querySelectorAll(".button-group");
  buttonGroups.forEach((bg) => {
    // Jangan hapus preview button group atau results button group
    if (bg !== previewSection.querySelector(".button-group") && !bg.classList.contains("results-button-group")) {
      bg.remove();
    }
  });
}

// Initialize
console.log("🍎 Apple Ripeness Detection System loaded");