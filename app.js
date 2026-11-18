
const $ = (id) => document.getElementById(id);

const API_URL = "https://cart3r-ai-backend.ggyyttyytt57.workers.dev";

const sidebar = $("sidebar");
const scrim = $("scrim");
const pages = ["chat", "studio", "history", "settings", "about"];

let selectedFile = null;
let deferredInstallPrompt = null;
let previewURL = null;
let chatHistory = [];

const API_URL = "https://cart3r-ai-backend.ggyyttyytt57.workers.dev";

function toggleMenu(open) {
  sidebar.classList.toggle("open", open);
  scrim.classList.toggle("show", open);
}

$("menuBtn").addEventListener("click", () =>
  toggleMenu(!sidebar.classList.contains("open"))
);

scrim.addEventListener("click", () => toggleMenu(false));

function showPage(name) {
  pages.forEach(p =>
    $(p + "Page").classList.toggle("active", p === name)
  );

  document.querySelectorAll(".nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.page === name)
  );

  $("composer").classList.toggle(
    "hidden",
    !["chat", "studio"].includes(name)
  );

  $("pageSubtitle").textContent = ({
    chat: "Personal AI workspace",
    studio: "Creative workspace",
    history: "Your conversations",
    settings: "Preferences",
    about: "System information"
  })[name];

  toggleMenu(false);
}

document.querySelectorAll(".nav-item").forEach(b =>
  b.addEventListener("click", () => showPage(b.dataset.page))
);

function addMessage(text, user = false) {
  $("welcome").classList.add("hidden");

  const node = document.createElement("div");
  node.className = "message" + (user ? " user" : "");

  const sender = document.createElement("div");
  sender.className = "sender";
  sender.textContent = user ? "YOU" : "CART3R AI";

  const body = document.createElement("div");
  body.textContent = text;

  node.append(sender, body);
  $("messages").appendChild(node);
  node.scrollIntoView({ behavior: "smooth", block: "end" });
}


async function sendMessage() {
  const input = $("messageInput");
  const value = input.value.trim();

  if (!value) return;

  addMessage(value, true);

  chatHistory.push({
    role: "user",
    content: value
  });

  input.value = "";
  input.style.height = "auto";

  const button = $("sendBtn");
  button.disabled = true;

  try {
    const response = await fetch(API_URL + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: chatHistory
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Chat AI gagal.");
    }

    addMessage(result.reply);

    chatHistory.push({
      role: "assistant",
      content: result.reply
    });

  } catch (error) {
    console.error(error);
    addMessage("Terjadi kesalahan: " + error.message);
    chatHistory.pop();
  } finally {
    button.disabled = false;
  }
}


$("sendBtn").addEventListener("click", sendMessage);

$("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

$("messageInput").addEventListener("input", e => {
  e.target.style.height = "auto";
  e.target.style.height =
    Math.min(e.target.scrollHeight, 110) + "px";
});

document.querySelectorAll(".suggestion").forEach(b => {
  b.addEventListener("click", () => {
    $("messageInput").value = b.dataset.prompt;
    sendMessage();
  });
});

$("newChatBtn").addEventListener("click", () => {
  $("messages").innerHTML = "";
  $("welcome").classList.remove("hidden");
  $("messageInput").value = "";
  showPage("chat");
});

// IMAGE UPLOAD

function chooseFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Pilih file gambar.");
    return;
  }

  selectedFile = file;

  $("attachmentChip").classList.remove("hidden");

  $("studioHint").textContent =
    "Foto berhasil dipilih. Tambahkan instruksi edit.";

  if (previewURL) URL.revokeObjectURL(previewURL);

  previewURL = URL.createObjectURL(file);

  $("imagePreview").src = previewURL;
  $("previewWrap").classList.remove("hidden");
}

function clearAttachment() {
  selectedFile = null;
  $("attachmentChip").classList.add("hidden");
}

$("attachBtn").addEventListener("click", () =>
  $("imageInput").click()
);

$("imageInput").addEventListener("change", e =>
  chooseFile(e.target.files[0])
);

$("clearAttachment").addEventListener("click", clearAttachment);

$("removeImage").addEventListener("click", () => {
  $("imagePreview").removeAttribute("src");
  $("previewWrap").classList.add("hidden");
  $("imageInput").value = "";
  $("editPrompt").value = "";
  selectedFile = null;

  const link = $("editDownloadLink");
  if (link) link.remove();

  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = null;
});

// RESIZE IMAGE FOR AI MODEL

async function resizeImage(file) {
  const image = new Image();
  const objectURL = URL.createObjectURL(file);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectURL;
    });

    const maxSize = 510;
    const scale = Math.min(
      1,
      maxSize / Math.max(image.width, image.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.88)
    );

    if (!blob) throw new Error("Gagal memproses foto.");

    return new File(
      [blob],
      "cart3r-input.jpg",
      { type: "image/jpeg" }
    );
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}

// DOWNLOAD RESULT

function createDownloadLink(dataURL) {
  let link = $("editDownloadLink");

  if (!link) {
    link = document.createElement("a");
    link.id = "editDownloadLink";

    link.style.display = "block";
    link.style.marginTop = "15px";
    link.style.padding = "12px";
    link.style.textAlign = "center";
    link.style.background = "#d71920";
    link.style.color = "#ffffff";
    link.style.borderRadius = "10px";
    link.style.textDecoration = "none";
    link.style.fontWeight = "bold";

    $("previewWrap").after(link);
  }

  link.href = dataURL;
  link.download = "CART3R-EDITED.png";
  link.textContent = "DOWNLOAD HASIL EDIT";
}

// AI PHOTO EDITOR

async function runPhotoEdit() {
  const file = selectedFile || $("imageInput").files[0];
  const prompt = $("editPrompt").value.trim();

  if (!file) {
    $("studioHint").textContent = "Pilih foto terlebih dahulu.";
    return;
  }

  if (!prompt) {
    $("studioHint").textContent =
      "Tuliskan perintah edit terlebih dahulu.";
    return;
  }

  const button = $("prepareEditBtn");
  button.disabled = true;
  button.textContent = "PROCESSING...";

  $("studioHint").textContent =
    "CART3R sedang memproses foto. Mohon tunggu...";

  try {
    const resizedFile = await resizeImage(file);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", resizedFile);

    const response = await fetch(API_URL + "/edit", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Pemrosesan foto gagal."
      );
    }

    if (!result.image) {
      throw new Error("Hasil gambar tidak ditemukan.");
    }

    $("imagePreview").src = result.image;
    $("previewWrap").classList.remove("hidden");

    createDownloadLink(result.image);

    $("studioHint").textContent =
      "Berhasil! Foto sudah diedit oleh CART3R AI.";

  } catch (error) {
    console.error(error);

    $("studioHint").textContent =
      "Gagal mengedit: " + error.message;

  } finally {
    button.disabled = false;
    button.textContent = "EDIT PHOTO";
  }
}

$("prepareEditBtn").addEventListener("click", runPhotoEdit);

// PWA INSTALLATION

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  $("installBtn").hidden = false;
});

$("installBtn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

if ("serviceWorker" in navigator &&
    location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(console.error);
  });
}
