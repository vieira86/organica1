/* ============================================================
   quizzes.js — lógica da página de quiz
   ============================================================ */

let quizTopicId = TOPICS[0].id;
let quizDeck = [];
let quizIndex = 0;
let quizScore = 0;
let answered = false;

function initQuiz(){
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("topic");
  if (fromUrl && getTopic(fromUrl)) quizTopicId = fromUrl;

  const chipsEl = document.getElementById("quiz-topic-chips");
  renderTopicChips(chipsEl, TOPICS, quizTopicId, selectQuizTopic);
  loadQuiz(quizTopicId);
}

function selectQuizTopic(id){
  quizTopicId = id;
  renderTopicChips(document.getElementById("quiz-topic-chips"), TOPICS, quizTopicId, selectQuizTopic);
  loadQuiz(id);
}

function loadQuiz(id){
  quizDeck = shuffleArray(QUIZZES[id] || []);
  quizIndex = 0;
  quizScore = 0;
  answered = false;
  renderQuiz();
}

function renderQuiz(){
  const body = document.getElementById("quiz-body");
  body.innerHTML = "";

  if (quizDeck.length === 0){
    body.innerHTML = '<div class="empty-state">Sem questões para este tópico ainda.</div>';
    return;
  }

  if (quizIndex >= quizDeck.length){
    const pct = Math.round((quizScore / quizDeck.length) * 100);
    body.innerHTML = `
      <div class="quiz-score">
        <div class="big">${quizScore} / ${quizDeck.length}</div>
        <p>Você acertou ${pct}% das questões sobre ${getTopic(quizTopicId).title}.</p>
        <button class="btn btn-primary" id="btn-restart">Refazer quiz</button>
      </div>`;
    document.getElementById("btn-restart").addEventListener("click", () => loadQuiz(quizTopicId));
    return;
  }

  answered = false;
  const item = quizDeck[quizIndex];
  const pctBar = Math.round((quizIndex / quizDeck.length) * 100);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pctBar}%"></div></div>
    <div class="badge">Questão ${quizIndex + 1} de ${quizDeck.length}</div>
    <div class="quiz-question">${item.q}</div>
    <div class="quiz-options" id="quiz-options"></div>
    <div id="quiz-feedback"></div>
  `;
  body.appendChild(wrap);

  const optsEl = document.getElementById("quiz-options");
  item.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => selectAnswer(idx));
    optsEl.appendChild(btn);
  });
}

function selectAnswer(idx){
  if (answered) return;
  answered = true;
  const item = quizDeck[quizIndex];
  const buttons = document.querySelectorAll("#quiz-options .quiz-option");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.correct) btn.classList.add("correct");
    else if (i === idx) btn.classList.add("incorrect");
  });

  if (idx === item.correct) quizScore++;

  const feedback = document.getElementById("quiz-feedback");
  feedback.innerHTML = `
    <div class="quiz-explain"><strong>${idx === item.correct ? "Correto! ✅" : "Não foi dessa vez ❌"}</strong><br>${item.explain}</div>
    <div style="text-align:center;"><button class="btn btn-primary" id="btn-next-q">Próxima questão →</button></div>
  `;
  document.getElementById("btn-next-q").addEventListener("click", () => {
    quizIndex++;
    renderQuiz();
  });
}

document.addEventListener("DOMContentLoaded", initQuiz);
