/* ============================================================
   app.js — comportamento compartilhado (navegação, menu mobile)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  // Marca o link ativo com base no arquivo atual
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
});

/* Utilitário: embaralhar array (Fisher-Yates) */
function shuffleArray(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Utilitário: cria os chips de seleção de tópico */
function renderTopicChips(container, topics, activeId, onSelect){
  container.innerHTML = "";
  topics.forEach(t => {
    const chip = document.createElement("button");
    chip.className = "topic-chip" + (t.id === activeId ? " active" : "");
    chip.textContent = t.short;
    chip.addEventListener("click", () => onSelect(t.id));
    container.appendChild(chip);
  });
}
