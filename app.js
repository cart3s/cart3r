const $ = (id) => document.getElementById(id);
const sidebar = $("sidebar"), scrim = $("scrim");
const pages = ["chat","studio","history","settings","about"];
let selectedFile = null;
let deferredInstallPrompt = null;

function toggleMenu(open) {
  sidebar.classList.toggle("open", open);
  scrim.classList.toggle("show", open);
}
$("menuBtn").addEventListener("click", () => toggleMenu(!sidebar.classList.contains("open")));
scrim.addEventListener("click", () => toggleMenu(false));

function showPage(name) {
  pages.forEach(p => $(p+"Page").classList.toggle("active", p === name));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === name));
  $("composer").classList.toggle("hidden", !["chat","studio"].includes(name));
  $("pageSubtitle").textContent = ({chat:"Personal AI workspace",studio:"Creative workspace",history:"Your conversations",settings:"Preferences",about:"System information"})[name];
  toggleMenu(false);
}
document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => showPage(b.dataset.page)));

function addMessage(text, user=false) {
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
  node.scrollIntoView({behavior:"smooth",block:"end"});
}
function sendMessage() {
  const value = $("messageInput").value.trim();
  if (!value && !selectedFile) return;
  addMessage((selectedFile ? "[Foto dilampirkan]\n" : "") + value, true);
  $("messageInput").value = "";
  $("messageInput").style.height = "auto";
  clearAttachment();
  setTimeout(() => addMessage("Ini masih mode demo. Hubungkan backend dan AI API pada tahap berikutnya agar CART3R AI dapat memberikan jawaban sungguhan."), 350);
}
$("sendBtn").addEventListener("click", sendMessage);
$("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
$("messageInput").addEventListener("input", e => {
  e.target.style.height = "auto";
  e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
});
document.querySelectorAll(".suggestion").forEach(b => b.addEventListener("click", () => {
  $("messageInput").value = b.dataset.prompt;
  sendMessage();
}));
$("newChatBtn").addEventListener("click", () => {
  $("messages").innerHTML = "";
  $("welcome").classList.remove("hidden");
  $("messageInput").value = "";
  showPage("chat");
});

function chooseFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Pilih file gambar."); return; }
  selectedFile = file;
  $("attachmentChip").classList.remove("hidden");
  $("studioHint").textContent = "Foto dipilih. Pemrosesan AI akan tersedia setelah backend terhubung.";
  const url = URL.createObjectURL(file);
  $("imagePreview").src = url;
  $("previewWrap").classList.remove("hidden");
}
function clearAttachment() {
  selectedFile = null;
  $("attachmentChip").classList.add("hidden");
}
$("attachBtn").addEventListener("click", () => $("imageInput").click());
$("imageInput").addEventListener("change", e => chooseFile(e.target.files[0]));
$("clearAttachment").addEventListener("click", clearAttachment);
$("removeImage").addEventListener("click", () => {
  $("imagePreview").removeAttribute("src");
  $("previewWrap").classList.add("hidden");
  $("imageInput").value = "";
});
$("prepareEditBtn").addEventListener("click", () => {
  if (!$("imageInput").files[0]) { $("studioHint").textContent = "Pilih foto terlebih dahulu."; return; }
  const prompt = $("editPrompt").value.trim();
  $("studioHint").textContent = prompt
    ? "Foto dan instruksi sudah disiapkan. Hubungkan AI image API melalui backend untuk menjalankan edit."
    : "Foto dipilih. Tambahkan instruksi edit sebelum menghubungkan API.";
});

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
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}
