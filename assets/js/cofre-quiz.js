/* ============================================================
   cofre-quiz.js — Desafio "Cofre Químico" (combustão completa)
   Química Orgânica I — Técnico, IFRO Ji-Paraná

   Fluxo:
     1) Gate (nome + turma)
     2) Enunciado + molécula + input da senha (5 dígitos)
     3) Se a senha bate com o hash guardado, o site pede ao Apps
        Script (Code.gs) um SORTEIO de prêmio. Quem sorteia é sempre
        o servidor — nunca este arquivo — assim ninguém consegue
        manipular o resultado pelo "Ver código-fonte" ou pelo console
        do navegador.

   A senha correta NÃO fica em texto puro no código — só o hash
   SHA-256 dela — para não aparecer só de abrir o "Ver código-fonte".
   Ainda assim, qualquer pessoa com tempo e um script pode tentar
   quebrar por força bruta (são só 100.000 combinações de 5
   dígitos); é uma barreira pedagógica, não uma senha de banco.
   ============================================================ */

const COFRE_PASSWORD_HASH = "3573b846517b985c4249c71ab2d464938bd51174060c233749662d8bf1b4af5c";

// Só para exibir o quadro informativo ANTES de abrir o cofre. Quem
// controla de verdade as vagas é google-apps-script/Code.gs — se
// mudar os números lá (COFRE_PRIZES), mude aqui também para o texto
// continuar batendo com a realidade.
const COFRE_PRIZES_INFO = [
  { label: "+5 pontos na prova",         vagas: 4 },
  { label: "+5 pontos no trabalho",       vagas: 4 },
  { label: "Cancelar 1 questão da prova", vagas: 2 }
];
const COFRE_TOTAL_VAGAS = COFRE_PRIZES_INFO.reduce((s, p) => s + p.vagas, 0); // 10
const COFRE_CONSOLATION_LABEL = "+1 ponto na prova";

let cofreState = { name: "", turma: "" };

function initCofre(){
  renderCofreGate();
}

/* ---------- SHA-256 (Web Crypto, nativo do navegador) ---------- */
async function cofreSha256Hex(message){
  const enc = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- TELA 1: NOME + TURMA ---------- */
function renderCofreGate(){
  const body = document.getElementById("cofre-body");
  body.innerHTML = `
    <div class="cofre-card cofre-gate">
      <h3 style="margin-top:0;">Antes de começar</h3>
      <p class="cofre-sub">Digite seu nome e turma. Isso é usado para registrar quem destrancou o cofre e
        qual prêmio foi sorteado.</p>
      <div class="field">
        <label for="cofre-input-name">Nome completo</label>
        <input type="text" id="cofre-input-name" placeholder="Seu nome" autocomplete="name">
      </div>
      <div class="field">
        <label for="cofre-input-turma">Turma</label>
        <input type="text" id="cofre-input-turma" placeholder="Ex.: 2º Técnico em Química" autocomplete="off">
      </div>
      <p class="hint-small" id="cofre-gate-error" style="color: var(--danger); display:none;">Preencha os dois campos para continuar.</p>
      <button class="btn btn-primary" id="cofre-btn-start" style="width:100%; justify-content:center;">Ver o desafio →</button>
    </div>
  `;
  document.getElementById("cofre-btn-start").addEventListener("click", () => {
    const name = document.getElementById("cofre-input-name").value.trim();
    const turma = document.getElementById("cofre-input-turma").value.trim();
    const err = document.getElementById("cofre-gate-error");
    if (!name || !turma){
      err.style.display = "block";
      return;
    }
    cofreState.name = name;
    cofreState.turma = turma;
    renderCofrePuzzle();
  });
}

/* ---------- TELA 2: ENUNCIADO + MOLÉCULA + SENHA ---------- */
function renderCofrePuzzle(){
  const body = document.getElementById("cofre-body");
  body.innerHTML = `
    <div class="cofre-card">
      <h3 style="margin-top:0;">🧪 A substância e a combustão completa</h3>
      <div class="cofre-mol-frame">
        <img src="molecula_organica.png" alt="Estrutura da substância orgânica do desafio">
        <div class="cofre-mol-caption">molecula_organica.png</div>
      </div>

      <ol class="cofre-steps">
        <li>Analise a estrutura acima e determine a <strong>fórmula molecular</strong> da substância
          (conte C, H, N e O).</li>
        <li>Essa substância sofre <strong>combustão completa</strong> na presença de O₂, formando
          <strong>CO₂</strong>, <strong>H₂O</strong> e <strong>N₂</strong> (o nitrogênio da molécula sai
          como gás nitrogênio, N₂, e não como óxido de nitrogênio).</li>
        <li>Escreva a equação e encontre os <strong>menores coeficientes estequiométricos inteiros</strong>
          que a balanceiam:</li>
      </ol>

      <div class="cofre-formula">substância + B O₂ → C CO₂ + D H₂O + E N₂</div>

      <p class="cofre-sub">Chame os coeficientes de <b>A, B, C, D, E</b>, na ordem em que aparecem acima:</p>
      <div class="cofre-legend">
        <span><b>A</b> — coeficiente da substância orgânica</span>
        <span><b>B</b> — coeficiente do O₂</span>
        <span><b>C</b> — coeficiente do CO₂</span>
        <span><b>D</b> — coeficiente do H₂O</span>
        <span><b>E</b> — coeficiente do N₂</span>
      </div>

      <p class="cofre-sub">Com A, B, C, D e E balanceados, calcule:</p>
      <div class="cofre-formula">((3A + 6B) × (5C − 1D)) / (2E)</div>
      <p class="cofre-sub">O resultado é um número de <strong>5 algarismos</strong>. Essa é a senha do cofre
        abaixo.</p>

      <p class="cofre-sub" id="cofre-vagas-info">
        🏆 Em jogo: os <strong>10 primeiros</strong> a destrancar o cofre concorrem, por sorteio, a um dos
        prêmios abaixo:
        ${COFRE_PRIZES_INFO.map(p => `${p.label} (${p.vagas} vaga${p.vagas === 1 ? "" : "s"})`).join(" · ")}.
        Do 11º em diante, quem resolver o desafio ganha <strong>${COFRE_CONSOLATION_LABEL}</strong> garantido.
        <span id="cofre-vagas-live"></span>
      </p>

      <div class="cofre-safe" id="cofre-safe">
        <div class="cofre-lock-icon">🔒</div>
        <div class="cofre-digits">
          <input type="tel" inputmode="numeric" maxlength="1" class="cofre-digit" data-i="0">
          <input type="tel" inputmode="numeric" maxlength="1" class="cofre-digit" data-i="1">
          <input type="tel" inputmode="numeric" maxlength="1" class="cofre-digit" data-i="2">
          <input type="tel" inputmode="numeric" maxlength="1" class="cofre-digit" data-i="3">
          <input type="tel" inputmode="numeric" maxlength="1" class="cofre-digit" data-i="4">
        </div>
        <button class="btn btn-primary" id="cofre-btn-unlock">Destrancar 🔓</button>
        <div class="cofre-msg" id="cofre-msg"></div>
      </div>
    </div>
  `;

  setupCofreDigitInputs();
  document.getElementById("cofre-btn-unlock").addEventListener("click", cofreTryUnlock);
  cofreLoadVagasInfo();
}

// Busca (best-effort, sem travar a tela) quantas das 10 vagas
// principais ainda restam, só para mostrar um contador motivacional.
function cofreLoadVagasInfo(){
  if (!SHEETS_WEBAPP_URL) return;
  fetch(`${SHEETS_WEBAPP_URL}?action=cofreStatus`)
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById("cofre-vagas-live");
      if (el && data && data.status === "ok" && typeof data.totalRestantes === "number"){
        el.textContent = ` (restam ${data.totalRestantes} de ${COFRE_TOTAL_VAGAS} vagas premiadas)`;
      }
    })
    .catch(() => { /* contador é só um extra — falha em silêncio */ });
}

function setupCofreDigitInputs(){
  const inputs = Array.from(document.querySelectorAll(".cofre-digit"));
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 1);
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener("keydown", (ev) => {
      if (ev.key === "Backspace" && !inp.value && i > 0) inputs[i - 1].focus();
      if (ev.key === "Enter") cofreTryUnlock();
    });
  });
  if (inputs[0]) inputs[0].focus();
}

async function cofreTryUnlock(){
  const inputs = Array.from(document.querySelectorAll(".cofre-digit"));
  const code = inputs.map(i => i.value).join("");
  const msgEl = document.getElementById("cofre-msg");
  const safeEl = document.getElementById("cofre-safe");

  if (code.length < 5){
    msgEl.textContent = "Digite os 5 algarismos da senha.";
    msgEl.className = "cofre-msg warn";
    return;
  }

  const hash = await cofreSha256Hex(code);

  if (hash === COFRE_PASSWORD_HASH){
    safeEl.classList.add("cofre-unlocked");
    msgEl.textContent = "🔓 Cofre destrancado! Parabéns.";
    msgEl.className = "cofre-msg ok";
    inputs.forEach(i => i.disabled = true);
    document.getElementById("cofre-btn-unlock").disabled = true;
    setTimeout(renderCofrePrizeStep, 900);
  } else {
    safeEl.classList.remove("cofre-shake");
    void safeEl.offsetWidth; // reinicia a animação
    safeEl.classList.add("cofre-shake");
    msgEl.textContent = "Senha incorreta. Revise o balanceamento e o cálculo.";
    msgEl.className = "cofre-msg err";
    inputs.forEach(i => { i.value = ""; });
    inputs[0].focus();
  }
}

/* ---------- TELA 3: SORTEIO DO PRÊMIO ---------- */
function renderCofrePrizeStep(){
  const body = document.getElementById("cofre-body");
  body.innerHTML = `
    <div class="cofre-card">
      <h3 style="margin-top:0;">🔓 Cofre destrancado!</h3>
      <p class="cofre-sub" id="cofre-prize-status">🎲 Sorteando seu prêmio…</p>
      <div id="cofre-prize-list"></div>
    </div>
  `;

  if (!SHEETS_WEBAPP_URL){
    document.getElementById("cofre-prize-status").textContent =
      "Registro em planilha não configurado (peça ao professor para configurar o Apps Script).";
    return;
  }

  // pequena pausa de suspense antes do resultado
  setTimeout(() => {
    cofreClaimPrize((result) => {
      const statusEl = document.getElementById("cofre-prize-status");
      const listEl = document.getElementById("cofre-prize-list");
      statusEl.textContent = "";

      if (result.status === "concedido"){
        const isPrincipal = result.tipoPremio === "Principal";
        listEl.innerHTML = `
          <div class="cofre-final">
            ${isPrincipal ? "🎉 Você foi sorteado!" : "🙌 Prêmio garantido:"}
            <strong>${result.premio}</strong>
            ${!isPrincipal ? `<br><span class="cofre-sub" style="display:block;margin-top:6px;">
              Os prêmios principais já tinham sido todos sorteados — esse é o prêmio garantido de quem
              resolve o desafio.</span>` : ""}
            <span class="cofre-registered">Foi registrado com seu nome e turma — combine com o professor.</span>
          </div>`;
      } else if (result.status === "networkerror"){
        listEl.innerHTML = `
          <div class="cofre-final">🔓 Cofre destrancado! Não foi possível confirmar o sorteio
          automaticamente (conexão instável) — anote o horário e avise o professor.</div>`;
      } else {
        listEl.innerHTML = `<div class="cofre-final">🔓 Cofre destrancado! Seu pedido foi registrado.</div>`;
      }
    });
  }, 1100);
}

/* ---------- REGISTRO / SORTEIO NO GOOGLE SHEETS (aba "Cofre") ---------- */
function cofreClaimPrize(onDone){
  const payload = {
    tipo: "cofre_claim",
    nome: cofreState.name,
    turma: cofreState.turma,
    dataHora: new Date().toLocaleString("pt-BR")
  };
  fetch(SHEETS_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(data => { if (onDone) onDone(data); })
    .catch(() => { if (onDone) onDone({ status: "networkerror" }); });
}

document.addEventListener("DOMContentLoaded", initCofre);
