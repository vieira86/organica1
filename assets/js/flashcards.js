/* ============================================================
   flashcards.js — lógica da página de flashcards
   ============================================================ */

let currentTopicId = TOPICS[0].id;
let currentDeck = [];
let currentIndex = 0;

function initFlashcards(){
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("topic");
  if (fromUrl && getTopic(fromUrl)) currentTopicId = fromUrl;

  const chipsEl = document.getElementById("topic-chips");
  renderTopicChips(chipsEl, TOPICS, currentTopicId, selectTopic);
  loadDeck(currentTopicId);

  document.getElementById("btn-flip").addEventListener("click", flipCard);
  document.getElementById("btn-next").addEventListener("click", nextCard);
  document.getElementById("btn-prev").addEventListener("click", prevCard);
  document.getElementById("btn-shuffle").addEventListener("click", () => {
    currentDeck = shuffleArray(currentDeck);
    currentIndex = 0;
    renderCard();
  });
  document.getElementById("flashcard").addEventListener("click", flipCard);
}

function selectTopic(id){
  currentTopicId = id;
  renderTopicChips(document.getElementById("topic-chips"), TOPICS, currentTopicId, selectTopic);
  loadDeck(id);
}

function loadDeck(id){
  currentDeck = FLASHCARDS[id] || [];
  currentIndex = 0;
  renderCard();
}

function renderCard(){
  const card = document.getElementById("flashcard");
  const total = currentDeck.length;
  card.classList.remove("flipped");

  if (total === 0){
    document.getElementById("card-front-text").textContent = "Sem flashcards para este tópico ainda.";
    document.getElementById("card-back-text").textContent = "";
    document.getElementById("flash-count").textContent = "0 / 0";
    return;
  }

  const item = currentDeck[currentIndex];
  document.getElementById("card-front-text").textContent = item.q;
  document.getElementById("card-back-text").textContent = item.a;
  document.getElementById("flash-count").textContent = `${currentIndex + 1} / ${total}`;
}

function flipCard(){
  document.getElementById("flashcard").classList.toggle("flipped");
}

function nextCard(){
  if (currentDeck.length === 0) return;
  currentIndex = (currentIndex + 1) % currentDeck.length;
  renderCard();
}

function prevCard(){
  if (currentDeck.length === 0) return;
  currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
  renderCard();
}

document.addEventListener("DOMContentLoaded", initFlashcards);
