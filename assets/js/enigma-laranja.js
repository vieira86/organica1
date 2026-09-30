/* ============================================================
   enigma-laranja.js — "Enigma: O Código do Agente-Laranja"
   Química Orgânica I — Técnico, IFRO Ji-Paraná

   Fluxo (cada etapa só abre depois que a anterior é resolvida):
     0) Gate (nome + turma)
     1) Funções orgânicas (múltipla escolha)
     2) Massa molar (aceita o valor arredondado para inteiro)
     3) Balanceamento da combustão completa (resolvido no caderno)
     4) Código final de 4 algarismos
   Ao abrir o cadeado final, o site envia ao Apps Script (Code.gs)
   nome, turma, nº de erros em cada etapa e o tempo gasto. Quem
   calcula a POSIÇÃO de chegada (1º, 2º, 3º...) é o servidor.

   Nenhuma resposta fica em texto puro aqui — só o hash SHA-256.
   É uma barreira pedagógica (dá para quebrar por força bruta),
   não uma segurança de verdade.
   O gabarito fica em google-apps-script/COMO_CONFIGURAR.md
   (fora do site), para não aparecer no "Ver código-fonte".
   ============================================================ */

const ENIG_HASH_ETAPA1 = "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d";
const ENIG_HASH_ETAPA2 = "67e9c3acebb154a282f326d4ff1951cd1f342e58e74d562b556b517da5e56132";
const ENIG_HASH_CODIGO = "b7d8243a7ffe14e85a24eb0abd4f42389c1cb615647ad6a8d31da72930fb622e";

// Erros "clássicos" do código final → dica específica em vez de só "errado".
const ENIG_DICAS_CODIGO = {
  // coeficiente fracionário no O₂ (não usou os menores INTEIROS)
  "10fc5d072454fbc12fce89009daa7a3fa271782b332f91f9b207a4704107b61f":
    "Quase! Parece que algum coeficiente ficou fracionário. Os coeficientes precisam ser os menores números INTEIROS — multiplique a equação toda.",
  // oxigênio desbalanceado
  "4459b2909cef1e99ddfb4be233208753a4ed2f43343df6d5b4561c5e9ead51c9":
    "Confira o oxigênio: conte os átomos de O dos dois lados (não esqueça os 3 O da própria molécula)."
};

const ENIG_CODE_LEN = 4;

let enigState = {
  name: "", turma: "",
  etapa: 1,
  erros: { 1: 0, 2: 0, 4: 0 },
  inicio: null
};

function initEnigma(){ renderEnigGate(); }

async function enigSha256Hex(message){
  const enc = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function enigShake(el){
  el.classList.remove("enig-shake");
  void el.offsetWidth;
  el.classList.add("enig-shake");
}

/* ---------- TELA 1: NOME + TURMA ---------- */
function renderEnigGate(){
  const body = document.getElementById("enig-body");
  body.innerHTML = `
    <div class="enig-card enig-gate">
      <h3>Antes de começar</h3>
      <p class="enig-sub">Digite seu nome e turma. Eles serão registrados junto com a sua ordem de chegada
        quando você decifrar o código.</p>
      <div class="field">
        <label for="enig-input-name">Nome completo</label>
        <input type="text" id="enig-input-name" placeholder="Seu nome" autocomplete="name">
      </div>
      <div class="field">
        <label for="enig-input-turma">Turma</label>
        <input type="text" id="enig-input-turma" placeholder="Ex.: 2º Técnico em Química" autocomplete="off">
      </div>
      <p class="hint-small" id="enig-gate-error" style="color: var(--danger); display:none;">Preencha os dois campos para continuar.</p>
      <button class="btn btn-primary" id="enig-btn-start" style="width:100%; justify-content:center;">Aceitar a missão →</button>
    </div>
  `;
  document.getElementById("enig-btn-start").addEventListener("click", () => {
    const name = document.getElementById("enig-input-name").value.trim();
    const turma = document.getElementById("enig-input-turma").value.trim();
    if (!name || !turma){
      document.getElementById("enig-gate-error").style.display = "block";
      return;
    }
    enigState.name = name;
    enigState.turma = turma;
    enigState.inicio = Date.now();
    renderEnigPuzzle();
  });
}

/* ---------- TELA 2: O ENIGMA ---------- */
function renderEnigPuzzle(){
  const body = document.getElementById("enig-body");
  body.innerHTML = `
    <div class="enig-card">
      <h3>🍊 O dossiê</h3>
      <div class="enig-story">
        Durante a Guerra do Vietnã, o chamado <em>Agente-Laranja</em>, utilizado como desfolhante, ficou
        conhecido pelos graves efeitos associados à exposição a seus componentes. Um dos seus componentes
        está representado abaixo.
      </div>
      <div class="enig-story">
        <strong>O código está escondido nos números da reação.</strong> Somente quem identificar
        corretamente a molécula, calcular sua massa e dominar o balanceamento conseguirá abrir o
        próximo nível.
      </div>
      <div class="enig-mol-frame">
        <img src="estruturas/agente_laranja.png" alt="Estrutura de um dos componentes do Agente-Laranja">
      </div>
    </div>

    <div class="enig-progress" id="enig-progress">
      <span class="enig-pill" data-p="1">🧪 1 · Funções</span>
      <span class="enig-pill" data-p="2">⚖️ 2 · Massa molar</span>
      <span class="enig-pill" data-p="3">🔥 3 · Reação</span>
      <span class="enig-pill" data-p="4">🕵️ 4 · Código</span>
    </div>

    <!-- ETAPA 1 -->
    <div class="enig-card enig-stage" id="enig-stage-1">
      <span class="enig-stage-tag">Etapa 1 · Identifique a molécula</span>
      <div class="enig-stage-body">
        <h3>🧪 Quais funções orgânicas estão presentes na molécula?</h3>
        <div class="enig-options" id="enig-options">
          <button class="enig-opt" data-v="a"><b>a)</b> éster, ácido carboxílico e hidrocarboneto.</button>
          <button class="enig-opt" data-v="b"><b>b)</b> éter, haleto orgânico e ácido carboxílico.</button>
          <button class="enig-opt" data-v="c"><b>c)</b> tiocomposto, cetona e álcool.</button>
          <button class="enig-opt" data-v="d"><b>d)</b> amina, ácido carboxílico e amida.</button>
          <button class="enig-opt" data-v="e"><b>e)</b> ácido carboxílico, éter e nitrocomposto.</button>
        </div>
        <div class="enig-msg" id="enig-msg-1"></div>
      </div>
    </div>

    <!-- ETAPA 2 -->
    <div class="enig-card enig-stage locked" id="enig-stage-2">
      <span class="enig-stage-tag">🔒 Etapa 2 · Descubra o primeiro número</span>
      <div class="enig-stage-body">
        <h3>⚖️ Calcule a massa molar do composto</h3>
        <p class="enig-sub">Primeiro monte a fórmula molecular (conte C, H, O e Cl), depois some as massas.</p>
        <p class="enig-masses">Massas atômicas: C = 12 · H = 1 · O = 16 · Cl = 35,5 (g/mol)</p>
        <div class="enig-row">
          <input type="text" inputmode="decimal" class="enig-input" id="enig-input-mm" placeholder="000">
          <span class="enig-unit">g/mol</span>
          <button class="btn btn-primary" id="enig-btn-mm">Verificar</button>
        </div>
        <div class="enig-msg" id="enig-msg-2"></div>
      </div>
    </div>

    <!-- ETAPA 3 -->
    <div class="enig-card enig-stage locked" id="enig-stage-3">
      <span class="enig-stage-tag">🔒 Etapa 3 · A reação secreta</span>
      <div class="enig-stage-body">
        <h3>🔥 A molécula foi submetida à combustão completa</h3>
        <p class="enig-sub">Para um composto que contém cloro, considere a reação geral:</p>
        <div class="enig-formula"><b>A</b> Molécula + <b>B</b> O₂ → <b>C</b> CO₂ + <b>D</b> HCl + <b>E</b> H₂O</div>
        <p class="enig-sub">Balanceie a equação com os <strong>menores coeficientes inteiros</strong> e
          descubra A, B, C, D e E:</p>
        <div class="enig-legend">
          <span><b>A</b> — da molécula</span>
          <span><b>B</b> — do O₂</span>
          <span><b>C</b> — do CO₂</span>
          <span><b>D</b> — do HCl</span>
          <span><b>E</b> — da H₂O</span>
        </div>
        <p class="enig-sub" style="margin-top:14px;">Depois, substitua os valores na expressão:</p>
        <div class="enig-formula">
          <span class="enig-frac"><span>(A + 20B) · (4C − E)</span><span>4D</span></span>
        </div>
        <p class="enig-sub">💡 Confira cada elemento dos dois lados — C, H, Cl <em>e</em> O — antes de seguir.
          Quando tiver o resultado, desça para a última fechadura.</p>
        <button class="btn btn-ghost" id="enig-btn-3">Tenho o resultado da expressão →</button>
      </div>
    </div>

    <!-- ETAPA 4 -->
    <div class="enig-card enig-stage locked" id="enig-stage-4">
      <span class="enig-stage-tag">🔒 Etapa 4 · O código final</span>
      <div class="enig-stage-body">
        <h3>🕵️ Você encontrou o número?</h3>
        <p class="enig-sub">Agora multiplique o resultado da expressão por 4.</p>
        <div class="enig-formula">CÓDIGO = resultado da expressão × 4</div>
        <div class="enig-safe" id="enig-safe">
          <div class="enig-lock-icon">🔒</div>
          <div class="enig-digits">
            ${Array.from({length: ENIG_CODE_LEN}, (_, i) =>
              `<input type="tel" inputmode="numeric" maxlength="1" class="enig-digit" data-i="${i}">`).join("")}
          </div>
          <button class="btn btn-primary" id="enig-btn-unlock">Destrancar 🔓</button>
          <div class="enig-msg" id="enig-msg-4"></div>
        </div>
      </div>
    </div>

    <div id="enig-result"></div>
  `;

  // Etapa 1
  document.querySelectorAll(".enig-opt").forEach(btn => {
    btn.addEventListener("click", () => enigCheckEtapa1(btn));
  });
  // Etapa 2
  document.getElementById("enig-btn-mm").addEventListener("click", enigCheckEtapa2);
  document.getElementById("enig-input-mm").addEventListener("keydown", ev => {
    if (ev.key === "Enter") enigCheckEtapa2();
  });
  // Etapa 3 (só avança; o resultado é conferido no código final)
  document.getElementById("enig-btn-3").addEventListener("click", () => {
    document.getElementById("enig-btn-3").disabled = true;
    enigUnlockStage(4);
  });
  // Etapa 4
  enigSetupDigits();
  document.getElementById("enig-btn-unlock").addEventListener("click", enigCheckCodigo);

  enigUpdateProgress();
}

function enigUpdateProgress(){
  document.querySelectorAll(".enig-pill").forEach(p => {
    const n = Number(p.dataset.p);
    p.classList.toggle("done", n < enigState.etapa);
    p.classList.toggle("on", n === enigState.etapa);
  });
}

function enigMarkSolved(n){
  const st = document.getElementById(`enig-stage-${n}`);
  st.classList.add("solved");
  const tag = st.querySelector(".enig-stage-tag");
  tag.textContent = "✅ " + tag.textContent.replace(/^(🔒|🔓)\s*/u, "");
}

function enigUnlockStage(n){
  enigMarkSolved(n - 1);
  enigState.etapa = n;
  const st = document.getElementById(`enig-stage-${n}`);
  st.classList.remove("locked");
  const tag = st.querySelector(".enig-stage-tag");
  tag.textContent = tag.textContent.replace("🔒 ", "🔓 ");
  enigUpdateProgress();
  setTimeout(() => {
    st.scrollIntoView({ behavior: "smooth", block: "start" });
    const first = st.querySelector("input");
    if (first) first.focus({ preventScroll: true });
  }, 250);
}

/* ---------- ETAPA 1 ---------- */
async function enigCheckEtapa1(btn){
  const msg = document.getElementById("enig-msg-1");
  const hash = await enigSha256Hex(btn.dataset.v);
  if (hash === ENIG_HASH_ETAPA1){
    btn.classList.add("right");
    document.querySelectorAll(".enig-opt").forEach(b => b.disabled = true);
    msg.textContent = "✔ Correto! Anote essa alternativa — a segunda fechadura se abriu.";
    msg.className = "enig-msg ok";
    setTimeout(() => enigUnlockStage(2), 700);
  } else {
    enigState.erros[1]++;
    btn.classList.add("wrong");
    btn.disabled = true;
    enigShake(document.getElementById("enig-options"));
    msg.textContent = "Não é essa. Observe com atenção os átomos diferentes de C e H — a que cada um está ligado?";
    msg.className = "enig-msg err";
  }
}

/* ---------- ETAPA 2 ---------- */
async function enigCheckEtapa2(){
  const input = document.getElementById("enig-input-mm");
  const msg = document.getElementById("enig-msg-2");
  const raw = input.value.trim().replace(",", ".");
  const val = Number(raw);
  if (!raw || !isFinite(val)){
    msg.textContent = "Digite um número (pode usar vírgula).";
    msg.className = "enig-msg warn";
    return;
  }
  // aceita tanto 221 quanto 221,03 (massas com mais casas decimais)
  const hash = await enigSha256Hex(String(Math.round(val)));
  if (hash === ENIG_HASH_ETAPA2){
    input.disabled = true;
    document.getElementById("enig-btn-mm").disabled = true;
    msg.textContent = "✔ Massa molar correta! Guarde esse número… e siga para a reação.";
    msg.className = "enig-msg ok";
    setTimeout(() => enigUnlockStage(3), 700);
  } else {
    enigState.erros[2]++;
    enigShake(input);
    msg.textContent = enigState.erros[2] >= 2
      ? "Ainda não. Confira a fórmula: quantos H há no anel com 3 substituintes? E lembre de contar os 2 Cl."
      : "Valor incorreto. Revise a fórmula molecular e as massas atômicas.";
    msg.className = "enig-msg err";
  }
}

/* ---------- ETAPA 4 ---------- */
function enigSetupDigits(){
  const inputs = Array.from(document.querySelectorAll(".enig-digit"));
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 1);
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener("keydown", (ev) => {
      if (ev.key === "Backspace" && !inp.value && i > 0) inputs[i - 1].focus();
      if (ev.key === "Enter") enigCheckCodigo();
    });
  });
}

async function enigCheckCodigo(){
  const inputs = Array.from(document.querySelectorAll(".enig-digit"));
  const code = inputs.map(i => i.value).join("");
  const msg = document.getElementById("enig-msg-4");
  const safe = document.getElementById("enig-safe");

  if (code.length < ENIG_CODE_LEN){
    msg.textContent = `Digite os ${ENIG_CODE_LEN} algarismos do código.`;
    msg.className = "enig-msg warn";
    return;
  }

  const hash = await enigSha256Hex(code);
  if (hash === ENIG_HASH_CODIGO){
    safe.classList.add("unlocked");
    safe.querySelector(".enig-lock-icon").textContent = "🔓";
    msg.textContent = "🔓 Código aceito! O Agente-Laranja foi decifrado.";
    msg.className = "enig-msg ok";
    inputs.forEach(i => i.disabled = true);
    document.getElementById("enig-btn-unlock").disabled = true;
    enigMarkSolved(4);
    enigState.etapa = 5;
    enigUpdateProgress();
    setTimeout(renderEnigFinal, 900);
  } else {
    enigState.erros[4]++;
    enigShake(safe.querySelector(".enig-digits"));
    msg.textContent = ENIG_DICAS_CODIGO[hash] || "Código incorreto. Revise o balanceamento e a conta da expressão.";
    msg.className = "enig-msg err";
    inputs.forEach(i => { i.value = ""; });
    inputs[0].focus();
  }
}

/* ---------- TELA FINAL + REGISTRO ---------- */
function renderEnigFinal(){
  const minutos = ((Date.now() - enigState.inicio) / 60000).toFixed(1).replace(".", ",");
  const box = document.getElementById("enig-result");
  box.innerHTML = `
    <div class="enig-card">
      <div class="enig-final">
        <span class="big">🏅</span>
        <strong>Missão cumprida, ${enigState.name.split(" ")[0]}!</strong><br>
        <span class="enig-sub">Tempo: ${minutos} min · erros no caminho: ${enigState.erros[1] + enigState.erros[2] + enigState.erros[4]}</span>
        <span class="enig-registered" id="enig-reg-status">📝 Registrando na planilha…</span>
      </div>
    </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "start" });

  const statusEl = document.getElementById("enig-reg-status");
  if (typeof ENIGMA_WEBAPP_URL === "undefined" || !ENIGMA_WEBAPP_URL){
    statusEl.textContent = "Registro em planilha não configurado — mostre esta tela ao professor.";
    return;
  }

  fetch(ENIGMA_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tipo: "enigma_laranja",
      nome: enigState.name,
      turma: enigState.turma,
      dataHora: new Date().toLocaleString("pt-BR"),
      errosEtapa1: enigState.erros[1],
      errosEtapa2: enigState.erros[2],
      errosCodigo: enigState.erros[4],
      tempoMin: minutos
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data && data.status === "ok" && data.posicao){
        statusEl.innerHTML = data.repetido
          ? `Você já tinha decifrado antes — sua posição continua sendo <strong>${data.posicao}º</strong>.`
          : `✅ Registrado! Você foi o <strong>${data.posicao}º</strong> a decifrar o código.`;
      } else {
        statusEl.textContent = "✅ Registrado com seu nome e turma.";
      }
    })
    .catch(() => {
      statusEl.textContent = "Não foi possível confirmar o registro (conexão instável) — mostre esta tela ao professor.";
    });
}

document.addEventListener("DOMContentLoaded", initEnigma);
