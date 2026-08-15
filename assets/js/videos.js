/* ============================================================
   videos.js — lógica da página de vídeos
   ============================================================ */

let videoTopicId = "all";

const ALL_TOPICS_CHIP = { id: "all", title: "Todos os vídeos", short: "Todos" };

function initVideos(){
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("topic");
  if (fromUrl && getTopic(fromUrl)) videoTopicId = fromUrl;

  const chipsEl = document.getElementById("video-topic-chips");
  const topicsWithAll = [ALL_TOPICS_CHIP, ...TOPICS];
  renderTopicChips(chipsEl, topicsWithAll, videoTopicId, selectVideoTopic);
  renderVideos();
}

function selectVideoTopic(id){
  videoTopicId = id;
  const topicsWithAll = [ALL_TOPICS_CHIP, ...TOPICS];
  renderTopicChips(document.getElementById("video-topic-chips"), topicsWithAll, videoTopicId, selectVideoTopic);
  renderVideos();
}

function renderVideos(){
  const grid = document.getElementById("video-grid");
  grid.innerHTML = "";

  const idsToShow = videoTopicId === "all" ? TOPICS.map(t => t.id) : [videoTopicId];

  idsToShow.forEach(id => {
    const topic = getTopic(id);
    const list = VIDEOS[id] || [];
    list.forEach(v => {
      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <div class="frame-wrap" data-id="${v.id}" data-title="${v.title.replace(/"/g, '&quot;')}">
          <img class="video-thumb" src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="Capa do vídeo: ${v.title}" loading="lazy">
          <button class="play-btn" aria-label="Reproduzir vídeo"></button>
        </div>
        <div class="meta">
          <span class="tag">${topic.short}</span>
          <h4>${v.title}</h4>
          <p>${v.desc}</p>
          <span class="channel">${v.channel}</span>
        </div>
      `;
      const frameWrap = card.querySelector(".frame-wrap");
      frameWrap.addEventListener("click", () => playVideo(frameWrap));
      grid.appendChild(card);
    });
  });

  if (grid.children.length === 0){
    grid.innerHTML = '<div class="empty-state">Nenhum vídeo cadastrado para este tópico ainda.</div>';
  }
}

function playVideo(frameWrap){
  const id = frameWrap.dataset.id;
  const title = frameWrap.dataset.title;
  frameWrap.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${id}?autoplay=1" title="${title}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;
}

document.addEventListener("DOMContentLoaded", initVideos);
