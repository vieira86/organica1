/* ============================================================
   molecules-quiz.js — lógica do Quiz de Moléculas e Nomenclatura
   Química Orgânica I — Técnico, IFRO Ji-Paraná
   ============================================================ */

const MOL_TIME_PER_QUESTION = 15; // segundos

let molState = {
  name: "",
  turma: "",
  levelIndex: 0,        // índice em MOL_LEVELS (0 a 3)
  questions: [],         // questões embaralhadas do nível atual
  qIndex: 0,
  levelScore: 0,
  totalScore: 0,
  totalAnswered: 0,
  answered: false,
  timerId: null,
  timeLeft: MOL_TIME_PER_QUESTION
};

function initMoleculesQuiz(){
  renderGate();
}

/* ---------- TELA DE IDENTIFICAÇÃO (NOME + TURMA) ---------- */
function renderGate(){
  stopMolTimer();
  const body = document.getElementById("mol-body");
  body.innerHTML = `
    <div class="mol-gate">
      <h3 style="margin-top:0;">Antes de começar</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Digite seu nome e turma. Isso permite que o
        professor acompanhe até onde cada aluno chegou no quiz.</p>
      <div class="field">
        <label for="mol-input-name">Nome completo</label>
        <input type="text" id="mol-input-name" placeholder="Seu nome" autocomplete="name">
      </div>
      <div class="field">
        <label for="mol-input-turma">Turma</label>
        <input type="text" id="mol-input-turma" placeholder="Ex.: 2º Técnico em Química" autocomplete="off">
      </div>
      <p class="hint-small" id="mol-gate-error" style="color: var(--danger); display:none;">Preencha os dois campos para continuar.</p>
      <button class="btn btn-primary" id="mol-btn-start" style="width:100%; justify-content:center;">Iniciar quiz →</button>
    </div>
  `;
  document.getElementById("mol-btn-start").addEventListener("click", () => {
    const name = document.getElementById("mol-input-name").value.trim();
    const turma = document.getElementById("mol-input-turma").value.trim();
    const err = document.getElementById("mol-gate-error");
    if (!name || !turma){
      err.style.display = "block";
      return;
    }
    molState.name = name;
    molState.turma = turma;
    molState.levelIndex = 0;
    molState.totalScore = 0;
    molState.totalAnswered = 0;
    startLevel(0);
  });
}

/* ---------- NÍVEIS ---------- */
function startLevel(levelIndex){
  molState.levelIndex = levelIndex;
  const levelNum = MOL_LEVELS[levelIndex].n;
  molState.questions = shuffleArray(getMoleculesByLevel(levelNum));
  molState.qIndex = 0;
  molState.levelScore = 0;
  molState.answered = false;
  renderQuestion();
}

function renderLevelDots(){
  return MOL_LEVELS.map((lvl, i) => {
    let cls = "mol-level-dot";
    if (i < molState.levelIndex) cls += " done";
    else if (i === molState.levelIndex) cls += " current";
    return `<div class="${cls}" title="Nível ${lvl.n} — ${lvl.title}">${lvl.n}</div>`;
  }).join("");
}

function renderQuestion(){
  const body = document.getElementById("mol-body");
  const lvl = MOL_LEVELS[molState.levelIndex];
  const total = molState.questions.length;

  if (molState.qIndex >= total){
    finishLevel();
    return;
  }

  molState.answered = false;
  const item = molState.questions[molState.qIndex];
  const pct = Math.round((molState.qIndex / total) * 100);

  body.innerHTML = `
    <div class="mol-levels">${renderLevelDots()}</div>
    <div class="badge" style="display:block; text-align:center; margin-bottom:10px;">Nível ${lvl.n} — ${lvl.title} · Questão ${molState.qIndex + 1} de ${total}</div>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="mol-timer-row">
      <div class="mol-timer-bar"><div class="mol-timer-fill" id="mol-timer-fill"></div></div>
      <span class="mol-timer-label" id="mol-timer-label">${MOL_TIME_PER_QUESTION}s</span>
    </div>
    <div class="mol-ask-type">${item.askType === "nome" ? "Nomenclatura" : "Função Orgânica"}</div>
    <div class="mol-drawing">${item.image ? `<img src="${item.image}" alt="Estrutura da molécula" class="mol-img">` : item.draw()}</div>
    <div class="quiz-question" style="text-align:center;">${item.question}</div>
    <div class="quiz-options" id="mol-options"></div>
    <div id="mol-feedback"></div>
  `;

  const optsEl = document.getElementById("mol-options");
  item.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => selectMolAnswer(idx));
    optsEl.appendChild(btn);
  });

  startMolTimer();
}

/* ---------- CRONÔMETRO (15s por pergunta) ---------- */
function startMolTimer(){
  stopMolTimer();
  molState.timeLeft = MOL_TIME_PER_QUESTION;
  updateMolTimerUI();
  molState.timerId = setInterval(() => {
    molState.timeLeft--;
    updateMolTimerUI();
    if (molState.timeLeft <= 0){
      stopMolTimer();
      handleMolTimeout();
    }
  }, 1000);
}

function stopMolTimer(){
  if (molState.timerId){
    clearInterval(molState.timerId);
    molState.timerId = null;
  }
}

function updateMolTimerUI(){
  const fill = document.getElementById("mol-timer-fill");
  const label = document.getElementById("mol-timer-label");
  if (!fill || !label) return;
  const pct = Math.max(0, (molState.timeLeft / MOL_TIME_PER_QUESTION) * 100);
  fill.style.width = `${pct}%`;
  label.textContent = `${Math.max(0, molState.timeLeft)}s`;
  fill.classList.toggle("low", molState.timeLeft <= 5);
}

function handleMolTimeout(){
  if (molState.answered) return;
  molState.answered = true;
  molState.totalAnswered++;
  const item = molState.questions[molState.qIndex];
  const buttons = document.querySelectorAll("#mol-options .quiz-option");
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.correct) btn.classList.add("correct");
  });

  const lvl = MOL_LEVELS[molState.levelIndex];
  const isLastQ = molState.qIndex === molState.questions.length - 1;

  const feedback = document.getElementById("mol-feedback");
  feedback.innerHTML = `
    <div class="quiz-explain"><strong>⏱️ Tempo esgotado!</strong><br>${item.explain}</div>
    <div style="text-align:center;"><button class="btn btn-primary" id="mol-btn-next">${isLastQ ? `Concluir Nível ${lvl.n} →` : "Próxima questão →"}</button></div>
  `;
  document.getElementById("mol-btn-next").addEventListener("click", () => {
    molState.qIndex++;
    renderQuestion();
  });
}

function selectMolAnswer(idx){
  if (molState.answered) return;
  stopMolTimer();
  molState.answered = true;
  const item = molState.questions[molState.qIndex];
  const buttons = document.querySelectorAll("#mol-options .quiz-option");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.correct) btn.classList.add("correct");
    else if (i === idx) btn.classList.add("incorrect");
  });

  if (idx === item.correct) molState.levelScore++;
  molState.totalAnswered++;

  const lvl = MOL_LEVELS[molState.levelIndex];
  const isLastQ = molState.qIndex === molState.questions.length - 1;

  const feedback = document.getElementById("mol-feedback");
  feedback.innerHTML = `
    <div class="quiz-explain"><strong>${idx === item.correct ? "Correto! ✅" : "Não foi dessa vez ❌"}</strong><br>${item.explain}</div>
    <div style="text-align:center;"><button class="btn btn-primary" id="mol-btn-next">${isLastQ ? `Concluir Nível ${lvl.n} →` : "Próxima questão →"}</button></div>
  `;
  document.getElementById("mol-btn-next").addEventListener("click", () => {
    molState.qIndex++;
    renderQuestion();
  });
}

/* ---------- FIM DE NÍVEL ---------- */
function finishLevel(){
  stopMolTimer();
  const lvl = MOL_LEVELS[molState.levelIndex];
  molState.totalScore += molState.levelScore;
  const isLastLevel = molState.levelIndex === MOL_LEVELS.length - 1;

  const body = document.getElementById("mol-body");
  body.innerHTML = `
    <div class="mol-levels">${renderLevelDots()}</div>
    <div class="mol-final">
      <div class="big">${molState.levelScore} / ${molState.questions.length}</div>
      <div class="sub">Você concluiu o Nível ${lvl.n} — ${lvl.title}.</div>
      <button class="btn btn-primary" id="mol-btn-continue">${isLastLevel ? "Ver resultado final →" : `Ir para o Nível ${MOL_LEVELS[molState.levelIndex+1].n} →`}</button>
      <div class="mol-log-status" id="mol-log-status">Registrando progresso…</div>
    </div>
  `;

  logMolProgress(lvl.n, isLastLevel, molState.levelScore, molState.questions.length);

  document.getElementById("mol-btn-continue").addEventListener("click", () => {
    if (isLastLevel) renderFinal();
    else startLevel(molState.levelIndex + 1);
  });
}

function renderFinal(){
  const body = document.getElementById("mol-body");
  body.innerHTML = `
    <div class="mol-final">
      <div class="big">${molState.totalScore} / ${molState.totalAnswered}</div>
      <div class="sub">Parabéns, ${molState.name}! Você concluiu todos os níveis do Quiz de Moléculas.</div>
      <button class="btn btn-ghost" id="mol-btn-restart">Refazer do início</button>
      <div class="mol-log-status">Seu progresso foi registrado com nome e turma.</div>
    </div>
  `;
  document.getElementById("mol-btn-restart").addEventListener("click", () => {
    renderGate();
  });
}

/* ---------- REGISTRO NO GOOGLE SHEETS ---------- */
function logMolProgress(levelReached, completedAll, levelScore, levelTotal){
  const statusEl = document.getElementById("mol-log-status");

  if (!SHEETS_WEBAPP_URL){
    if (statusEl) statusEl.textContent = "Registro em planilha não configurado (veja SHEETS_WEBAPP_URL).";
    return;
  }

  const payload = {
    plataforma: SHEETS_PLATFORM_NAME,
    nome: molState.name,
    turma: molState.turma,
    nivelAlcancado: levelReached,
    concluiuTudo: completedAll ? "Sim" : "Não",
    acertosNivel: `${levelScore}/${levelTotal}`,
    dataHora: new Date().toLocaleString("pt-BR")
  };

  fetch(SHEETS_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(() => {
    if (statusEl) statusEl.textContent = "Progresso registrado ✓";
  }).catch(() => {
    if (statusEl) statusEl.textContent = "Não foi possível registrar (verifique sua conexão).";
  });
}

document.addEventListener("DOMContentLoaded", initMoleculesQuiz);
