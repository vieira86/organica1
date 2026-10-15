/* ============================================================
   enigma-taxol.js — "Enigma: O Teixo e o Código do Taxol"
   Química Orgânica I — Técnico, IFRO Ji-Paraná

   Fluxo (cada etapa só abre depois que a anterior é resolvida):
     0) Gate (nome + turma) + o texto do teixo
     1) Leitura: 5 perguntas sobre o texto (uma de cada vez)
     2) Funções orgânicas do paclitaxel (marcar TODAS as presentes)
     3) Fórmula molecular (C, H, N, O) e massa molar
     4) Balanceamento da combustão completa (N → N₂), no caderno
     5) Código final de 4 algarismos
   Ao abrir o cadeado final, o site envia ao Apps Script
   (google-apps-script/enigma-taxol/Code.gs) nome, turma, nº de
   erros em cada etapa e o tempo gasto. Quem calcula a POSIÇÃO de
   chegada (1º, 2º, 3º...) é o servidor.

   Nenhuma resposta fica em texto puro aqui — só o hash SHA-256.
   É uma barreira pedagógica (dá para quebrar por força bruta),
   não uma segurança de verdade.
   O gabarito fica em google-apps-script/enigma-taxol/COMO_CONFIGURAR.md
   (fora do site), para não aparecer no "Ver código-fonte".
   ============================================================ */

// Etapa 1 — hash de "q<n>:<letra>"
const TAX_HASH_LEITURA = [
  "de5bd8bd9e3b0d559e6cdbbbf78b05eb70c4c73ee748cea18869abb29986e490",
  "a65159c53aa91ad7ec8a4f2164af713f3d15cf2cb8599aa316a136ad0f8483db",
  "6bfe40d993db6cd74fd75b410a8ae68af80c0095117aeeae6720e592e04411e2",
  "f89054f982e1a034e564476045b308ab38090c7c35d89106fa31091968f6c881",
  "1866a4112f73f8fdd0a4bd479e9dafef7593bcce784b58a18985bbe41fa5ca36"
];
// Etapa 2 — hash das funções marcadas, em ordem alfabética, separadas por vírgula
const TAX_HASH_FUNCOES = "4cf888cc08a0cf7ea3d345af752608d9f864acb4ddc91d800308ed9821686702";
// Etapa 3 — hash de "<Elemento>:<n>"
const TAX_HASH_FORMULA = {
  C: "595482f2e965b9a736b254c6fec6b2c709b29ad386f6e0dd7c63d86d252287c6",
  H: "8c1c6ec9ee6402e4576568de66e9f21a02bc9be08e8d17f747d33ec5813cda8b",
  N: "238b99a5f26292e9a2183bd2242568bb86a27d4120d7013c5a9fb84d6457ec08",
  O: "e7816f5e034353223de03ea74437a99d37a30bdaaa8fed087225d7457408ae33"
};
// massa molar (aceita o inteiro com massas inteiras ou com uma casa decimal)
const TAX_HASH_MASSA = [
  "7fc81a57656ec055615121454cb5343aaf3db93c762fe310d976e5fe8d05e66d",
  "f0cbba2470c7c8706fe77e8d88e947ed8c33100409ffb51ae1af99af7d3077a8"
];
const TAX_HASH_CODIGO = "6d62aa4b52071e39f064a930d190b85ab327eb1a5045a8050ac538666ee765ca";

// Erros "clássicos" do código final → dica específica em vez de só "errado".
const TAX_DICAS_CODIGO = {
  // esqueceu de descontar os O da própria molécula
  "95fc6cd8aeb992c4169c1f26d4514523b37130b38ce5ca12500e621145be3e15":
    "Quase! Confira o oxigênio: a própria molécula já traz 14 átomos de O. Eles também entram na conta do lado dos reagentes.",
  // coeficiente fracionário no O₂
  "c0d7c54022345b39c9be73e19b30ccb040ba03b1fefb2566a9f510a09aba4796":
    "Quase! Parece que algum coeficiente ficou fracionário. Os coeficientes precisam ser os menores números INTEIROS — multiplique a equação toda."
};

const TAX_CODE_LEN = 4;

// Perguntas de leitura (a correta é conferida pelo hash, não aparece aqui)
const TAX_PERGUNTAS = [
  {
    enunciado: "“Há 150 anos, o futuro chegou. Fábricas cresceram pela paisagem como erva daninha…” O cenário descrito no início do texto remete a qual período histórico?",
    opcoes: {
      a: "Idade Média, com seus castelos e feudos.",
      b: "Revolução Industrial, com fábricas, rios poluídos e o céu cheio de fumaça.",
      c: "Grandes Navegações, com a descoberta de novas terras.",
      d: "Pré-história, antes do surgimento da agricultura.",
      e: "Era digital, com computadores e internet."
    },
    dica: "Releia o primeiro parágrafo: fábricas, rios negros, fumaça e cinzas…"
  },
  {
    enunciado: "De acordo com o próprio diálogo do texto, o que é um “apotecário”?",
    opcoes: {
      a: "Um sacerdote que cuidava da congregação.",
      b: "Um lenhador que cortava árvores medicinais.",
      c: "Um médico moderno formado na cidade.",
      d: "Um nome antigo para farmacêutico.",
      e: "O monstro que vive dentro da árvore."
    },
    dica: "O menino pergunta “Do quê?” — e a árvore responde logo em seguida."
  },
  {
    enunciado: "Por que o apotecário queria tanto o teixo?",
    opcoes: {
      a: "Porque seus frutos e sua casca podiam curar quase todas as doenças — se misturados pelo apotecário certo.",
      b: "Porque queria vender a madeira para as fábricas da cidade.",
      c: "Porque o presbítero havia pedido que ele cortasse a árvore.",
      d: "Porque a árvore era considerada sagrada pela congregação.",
      e: "Porque precisava de lenha para o inverno."
    },
    dica: "Procure o trecho em que a grande árvore diz ser “a mais importante de todas as áreas curativas”."
  },
  {
    enunciado: "Quando surge, a árvore destrói a casa do presbítero — e não a do apotecário. Segundo o teixo, por quê?",
    opcoes: {
      a: "Porque o presbítero havia cortado o teixo sem permissão.",
      b: "Porque o apotecário pediu à árvore que se vingasse por ele.",
      c: "Porque o presbítero era ganancioso e rude com os aldeões.",
      d: "Porque o presbítero se recusou a pedir ajuda ao apotecário.",
      e: "Porque o presbítero era “um homem de fé sem fé”: estava disposto a abandonar tudo aquilo em que acreditava."
    },
    dica: "Releia as últimas falas da árvore: o que ela diz sobre a fé?"
  },
  {
    enunciado: "De acordo com o texto, por que o teixo (Taxus baccata) é conhecido como “a árvore da vida e da morte”?",
    opcoes: {
      a: "Porque vive muitos séculos e depois morre de repente.",
      b: "Porque suas folhas são verdes no verão e caem no inverno.",
      c: "Porque contém metabólitos com potencial para curar diferentes tipos de câncer, mas seus frutos e sementes estão repletos de alcaloides tóxicos.",
      d: "Porque era plantado ao mesmo tempo em cemitérios e em maternidades.",
      e: "Porque suas raízes destroem as casas construídas perto dele."
    },
    dica: "Leia o quadro sobre o teixo, logo abaixo da história."
  }
];

// Funções da etapa 2 (ordem de exibição)
const TAX_FUNCOES = [
  ["acido", "Ácido carboxílico"], ["alcool", "Álcool"], ["aldeido", "Aldeído"],
  ["amida", "Amida"], ["amina", "Amina"], ["cetona", "Cetona"],
  ["ester", "Éster"], ["eter", "Éter"], ["fenol", "Fenol"], ["haleto", "Haleto orgânico"]
];
// Dicas para alternativas marcadas por engano (só a partir do 2º erro)
const TAX_DICAS_FUNCOES = {
  amina: "Você marcou amina: observe a que o N está ligado. Um N ligado diretamente a um C=O forma outra função.",
  fenol: "Você marcou fenol: algum OH está ligado diretamente a um anel benzênico?",
  acido: "Você marcou ácido carboxílico: algum grupo C=O–O termina em H (–COOH)? Ou o O está ligado a outro carbono?",
  aldeido: "Você marcou aldeído: algum C=O tem um H ligado diretamente a ele (–CHO)?",
  haleto: "Você marcou haleto orgânico: existe algum F, Cl, Br ou I na molécula?"
};

let taxState = {
  name: "", turma: "",
  etapa: 1,
  pergunta: 0,
  erros: { leitura: 0, funcoes: 0, formula: 0, massa: 0, codigo: 0 },
  inicio: null
};

function initEnigmaTaxol(){ renderTaxGate(); }

async function taxSha256Hex(message){
  const enc = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function taxShake(el){
  el.classList.remove("enig-shake");
  void el.offsetWidth;
  el.classList.add("enig-shake");
}

/* ---------- TELA 1: NOME + TURMA ---------- */
function renderTaxGate(){
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
      <div class="enig-ava" style="margin:4px 0 18px;">
        <strong class="ava-title">⚠️ ATENÇÃO: SÓ SERÁ COMPUTADO SE VOCÊ COLOCAR NO AVA:</strong>
        <ul>
          <li>o <strong>desenho da molécula de Taxol</strong> (paclitaxel), feito por você;</li>
          <li><strong>circuladas todas as funções orgânicas</strong> da molécula, com o nome de cada uma;</li>
          <li>os <strong>cálculos da combustão</strong>: o balanceamento da equação e a conta da expressão até o código.</li>
        </ul>
        <p style="margin:8px 0 0; font-size:0.9rem;">📝 Tenha papel e caneta à mão e guarde seus cálculos durante o desafio.</p>
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
    taxState.name = name;
    taxState.turma = turma;
    taxState.inicio = Date.now();
    renderTaxPuzzle();
  });
}

/* ---------- O TEXTO ---------- */
function taxTextoHTML(){
  return `
    <div class="enig-text" tabindex="0" aria-label="Texto: o teixo e o apotecário">
      <p>Há 150 anos, o futuro chegou. Fábricas cresceram pela paisagem como erva daninha. Árvores caíram, rios
        ficaram negros e o céu se encheu de fumaça e cinzas. Mas ainda havia verde, se soubesse onde olhar.</p>
      <p>Nos limites dessa cidade vivia um homem teimoso, que se recusava a mudar. Ele mexia com formas antigas de
        medicina, ervas, cascas e poções criadas a partir de frutas e folhas.</p>
      <p class="fala">Os aldeões o chamavam de apotecário.</p>
      <p class="fala">Do quê?</p>
      <p class="fala">Apotecário. É um nome antigo para farmacêutico.</p>
      <p class="fala">Por que não disse isso, então?</p>
      <p>Havia também um jovem nesse vilarejo, um homem instruído e bom, que apenas queria o melhor para sua
        congregação. Ele pregava contra os métodos antigos do apotecário. E o mau humor e a ganância do apotecário
        fizeram com que esses sermões ganhassem atenção. Por mais que tentasse continuar ajudando a comunidade, seu
        negócio faliu, o que o fez ficar muito amargo. No terreno do presbitério também havia um teixo.</p>
      <p class="fala">É a colina onde você mora — disse o pequeno Conor.</p>
      <p class="fala">O teixo é a mais importante de todas as áreas curativas — salientou a grande árvore.</p>
      <p class="fala">Por quê? — questionou Conor.</p>
      <p class="fala">Seus frutos e sua casca vibram e queimam repletos de vida. Podem curar quase todas as doenças.</p>
      <p class="fala">Mesmo? Todas?</p>
      <p class="fala">Tudo que possa ser curado, se misturado pelo apotecário certo.</p>
      <p>O apotecário queria muito o teixo. Mas, para colher suas partes, ele precisaria cortá-lo. E isso o
        presbítero não permitia.</p>
      <p>O presbítero tinha duas filhas que eram a luz de sua vida. Ele era um pai cuidadoso e amável, que faria
        qualquer coisa pelo bem delas. Mas um dia as garotinhas foram atingidas por uma terrível doença, e nada que o
        presbítero fez ajudou. Nenhuma cura dos médicos modernos, nenhuma oração, nada. Não havia escolha a não ser
        falar com o apotecário.</p>
      <p class="fala">Você pode ajudar minhas filhas? — implorou o presbítero. — Não pode salvar duas garotinhas inocentes?</p>
      <p class="fala">Por que eu deveria? — disse o apotecário. — Você me levou à falência com seus sermões, não me
        deixou cortar o teixo, minha melhor fonte de cura.</p>
      <p class="fala">Você pode ficar com o teixo — disse o presbítero. — Eu farei sermões a seu favor. Farei qualquer
        coisa se você salvar minhas filhas.</p>
      <p class="fala">Você abandonaria tudo em que acredita? — disse o apotecário.</p>
      <p class="fala">Para salvá-las, eu abandonaria tudo.</p>
      <p class="fala">Então não posso fazer nada para ajudá-lo…</p>
      <p>No dia seguinte, as filhas do presbítero morreram.</p>
      <p class="fala">O quê?</p>
      <p class="fala">Naquela noite, eu surgi.</p>
      <p class="fala">Ótimo, ele merece toda punição do mundo! — disse o menino, referindo-se ao velho sábio.</p>
      <p class="fala">Com certeza. Pouco depois da meia-noite, destruí a casa do presbítero, até as fundações.</p>
      <p class="fala">Do presbítero? O que está dizendo? O apotecário é malvado.</p>
      <p class="fala">Ele era ganancioso e rude, mas ainda era um curandeiro. Já o presbítero, o que ele era? Um homem
        de fé sem fé. Fé é a metade da cura. Crença na cura, crença no futuro que o espera. Sua crença é valiosa,
        então deve prestar atenção em onde a coloca, e em quem.</p>
      <p class="credit">Diálogo de <em>Sete Minutos Depois da Meia-Noite</em> (baseado no livro de Patrick Ness).</p>
    </div>

    <div class="enig-box">
      <span class="ico">🌲</span>
      <div><strong>Teixo</strong> — árvore de nome científico <em>Taxus baccata</em>, muito procurada pelas
        indústrias farmacêuticas. Conhecida como a árvore da vida e da morte. <strong>Da vida</strong>, por apresentar
        moléculas com potencial curativo. <strong>Da morte</strong>, por estar repleta de alcaloides venenosos.</div>
    </div>

    <div class="enig-story">
      O trecho mostra o diálogo fantasioso entre um menino e um monstro da árvore. A árvore que narra o texto é um
      <em>teixo</em> (<em>Taxus baccata</em>), conhecida como a árvore da vida e da morte. Pelo lado positivo, é muito
      desejada pelas indústrias farmacêuticas por conter metabólitos com potencial para curar diferentes tipos de
      câncer. Pelo lado ruim, frutos e sementes estão repletos de alcaloides tóxicos, que podem causar a morte.
    </div>
  `;
}

/* ---------- TELA 2: O ENIGMA ---------- */
function renderTaxPuzzle(){
  const body = document.getElementById("enig-body");
  const letras = ["a", "b", "c", "d", "e"];
  const perguntasHTML = TAX_PERGUNTAS.map((q, i) => `
    <div class="enig-q ${i > 0 ? "hidden" : ""}" id="tax-q-${i}">
      <span class="enig-q-num">Pergunta ${i + 1} de ${TAX_PERGUNTAS.length}</span>
      <h4>${q.enunciado}</h4>
      <div class="enig-options" id="tax-opts-${i}">
        ${letras.map(l => `<button class="enig-opt" data-q="${i}" data-v="${l}"><b>${l})</b> ${q.opcoes[l]}</button>`).join("")}
      </div>
      <div class="enig-msg" id="tax-msg-q-${i}"></div>
    </div>`).join("");

  body.innerHTML = `
    <div class="enig-card">
      <h3>📜 O teixo e o apotecário</h3>
      <p class="enig-sub">Leia o texto com atenção. As respostas da primeira fechadura estão nele.</p>
      ${taxTextoHTML()}
    </div>

    <div class="enig-progress" id="enig-progress">
      <span class="enig-pill" data-p="1">📖 1 · Leitura</span>
      <span class="enig-pill" data-p="2">🧪 2 · Funções</span>
      <span class="enig-pill" data-p="3">⚖️ 3 · Fórmula</span>
      <span class="enig-pill" data-p="4">🔥 4 · Combustão</span>
      <span class="enig-pill" data-p="5">🕵️ 5 · Código</span>
    </div>

    <!-- ETAPA 1 -->
    <div class="enig-card enig-stage" id="enig-stage-1">
      <span class="enig-stage-tag">Etapa 1 · Interprete o texto</span>
      <div class="enig-stage-body">
        <h3>📖 O que o teixo contou?</h3>
        <p class="enig-sub">Responda às perguntas na ordem. Cada acerto libera a próxima.</p>
        ${perguntasHTML}
      </div>
    </div>

    <!-- ETAPA 2 -->
    <div class="enig-card enig-stage locked" id="enig-stage-2">
      <span class="enig-stage-tag">🔒 Etapa 2 · Do teixo ao Taxol</span>
      <div class="enig-stage-body">
        <div class="enig-story">
          Um dos metabólitos “da vida” do teixo é o <em>paclitaxel</em>, vendido como <em>Taxol®</em> e usado na
          quimioterapia de cânceres de mama, ovário e pulmão. Ele foi isolado primeiro da casca do teixo-do-pacífico
          (<em>Taxus brevifolia</em>); hoje é obtido por semissíntese a partir de um precursor extraído das folhas do
          teixo europeu (<em>Taxus baccata</em>) — sem precisar derrubar a árvore.
        </div>
        <div class="enig-mol-frame">
          <img src="estruturas/taxol.png" alt="Estrutura do paclitaxel (Taxol)">
          <div class="enig-mol-cap">Paclitaxel (Taxol®)</div>
        </div>
        <h3>🧪 Quais funções orgânicas estão presentes no paclitaxel?</h3>
        <p class="enig-sub">Marque <strong>todas</strong> as funções presentes — e nenhuma a mais. Depois clique em verificar.</p>
        <div class="enig-checks" id="tax-checks">
          ${TAX_FUNCOES.map(([id, nome]) => `
            <label class="enig-check"><input type="checkbox" value="${id}"> ${nome}</label>`).join("")}
        </div>
        <button class="btn btn-primary" id="tax-btn-funcoes">Verificar funções</button>
        <div class="enig-msg" id="enig-msg-2"></div>
      </div>
    </div>

    <!-- ETAPA 3 -->
    <div class="enig-card enig-stage locked" id="enig-stage-3">
      <span class="enig-stage-tag">🔒 Etapa 3 · Conte os átomos</span>
      <div class="enig-stage-body">
        <h3>⚖️ Qual é a fórmula molecular do paclitaxel?</h3>
        <p class="enig-sub">Conte os átomos de cada elemento na estrutura. Lembre: nas fórmulas de linha, cada vértice é
          um carbono e os hidrogênios ligados a carbono não aparecem — complete as 4 ligações de cada C.</p>
        <div class="enig-formula-inputs">
          <span class="el">C</span><input type="text" inputmode="numeric" class="enig-input" id="tax-f-C" placeholder="?" aria-label="Número de carbonos">
          <span class="el">H</span><input type="text" inputmode="numeric" class="enig-input" id="tax-f-H" placeholder="?" aria-label="Número de hidrogênios">
          <span class="el">N</span><input type="text" inputmode="numeric" class="enig-input" id="tax-f-N" placeholder="?" aria-label="Número de nitrogênios">
          <span class="el">O</span><input type="text" inputmode="numeric" class="enig-input" id="tax-f-O" placeholder="?" aria-label="Número de oxigênios">
        </div>
        <div style="text-align:center;"><button class="btn btn-primary" id="tax-btn-formula">Verificar fórmula</button></div>
        <div class="enig-msg" id="tax-msg-formula" style="text-align:center;"></div>

        <div class="enig-sub-step hidden" id="tax-massa-step">
          <h3>Agora, a massa molar</h3>
          <p class="enig-masses">Massas atômicas: C = 12 · H = 1 · N = 14 · O = 16 (g/mol)</p>
          <div class="enig-row">
            <input type="text" inputmode="decimal" class="enig-input" id="tax-input-mm" placeholder="000">
            <span class="enig-unit">g/mol</span>
            <button class="btn btn-primary" id="tax-btn-mm">Verificar</button>
          </div>
          <div class="enig-msg" id="tax-msg-mm"></div>
        </div>
      </div>
    </div>

    <!-- ETAPA 4 -->
    <div class="enig-card enig-stage locked" id="enig-stage-4">
      <span class="enig-stage-tag">🔒 Etapa 4 · A combustão do Taxol</span>
      <div class="enig-stage-body">
        <h3>🔥 O paclitaxel foi submetido à combustão completa</h3>
        <p class="enig-sub">Na combustão completa, o carbono vira CO₂, o hidrogênio vira H₂O e o
          <strong>nitrogênio é liberado como N₂</strong>. Considere a reação geral:</p>
        <div class="enig-formula"><b>A</b> C₄₇H₅₁NO₁₄ + <b>B</b> O₂ → <b>C</b> CO₂ + <b>D</b> H₂O + <b>E</b> N₂</div>
        <p class="enig-sub">Balanceie a equação no caderno com os <strong>menores coeficientes inteiros</strong> e
          descubra A, B, C, D e E:</p>
        <div class="enig-legend">
          <span><b>A</b> — do paclitaxel</span>
          <span><b>B</b> — do O₂</span>
          <span><b>C</b> — do CO₂</span>
          <span><b>D</b> — da H₂O</span>
          <span><b>E</b> — do N₂</span>
        </div>
        <p class="enig-sub" style="margin-top:14px;">Depois, substitua os valores na expressão:</p>
        <div class="enig-formula">
          <span class="enig-frac"><span>A·B + C·E + D</span><span>2E</span></span>
        </div>
        <p class="enig-sub">💡 Confira cada elemento dos dois lados — C, H, N <em>e</em> O — antes de seguir.
          Quando tiver o resultado, desça para a última fechadura.</p>
        <button class="btn btn-ghost" id="tax-btn-4">Tenho o resultado da expressão →</button>
      </div>
    </div>

    <!-- ETAPA 5 -->
    <div class="enig-card enig-stage locked" id="enig-stage-5">
      <span class="enig-stage-tag">🔒 Etapa 5 · O código final</span>
      <div class="enig-stage-body">
        <h3>🕵️ Você encontrou o número?</h3>
        <p class="enig-sub">Agora multiplique o resultado da expressão por 4.</p>
        <div class="enig-formula">CÓDIGO = resultado da expressão × 4</div>
        <div class="enig-safe" id="enig-safe">
          <div class="enig-lock-icon">🔒</div>
          <div class="enig-digits">
            ${Array.from({length: TAX_CODE_LEN}, (_, i) =>
              `<input type="tel" inputmode="numeric" maxlength="1" class="enig-digit" data-i="${i}" aria-label="Algarismo ${i + 1}">`).join("")}
          </div>
          <button class="btn btn-primary" id="enig-btn-unlock">Destrancar 🔓</button>
          <div class="enig-msg" id="enig-msg-5"></div>
        </div>
      </div>
    </div>

    <div id="enig-result"></div>
  `;

  // Etapa 1
  document.querySelectorAll("#enig-stage-1 .enig-opt").forEach(btn => {
    btn.addEventListener("click", () => taxCheckPergunta(btn));
  });
  // Etapa 2
  document.querySelectorAll(".enig-check input").forEach(cb => {
    cb.addEventListener("change", () => cb.parentElement.classList.toggle("sel", cb.checked));
  });
  document.getElementById("tax-btn-funcoes").addEventListener("click", taxCheckFuncoes);
  // Etapa 3
  ["C", "H", "N", "O"].forEach(el => {
    document.getElementById(`tax-f-${el}`).addEventListener("keydown", ev => {
      if (ev.key === "Enter") taxCheckFormula();
    });
  });
  document.getElementById("tax-btn-formula").addEventListener("click", taxCheckFormula);
  document.getElementById("tax-btn-mm").addEventListener("click", taxCheckMassa);
  document.getElementById("tax-input-mm").addEventListener("keydown", ev => {
    if (ev.key === "Enter") taxCheckMassa();
  });
  // Etapa 4 (só avança; o resultado é conferido no código final)
  document.getElementById("tax-btn-4").addEventListener("click", () => {
    document.getElementById("tax-btn-4").disabled = true;
    taxUnlockStage(5);
  });
  // Etapa 5
  taxSetupDigits();
  document.getElementById("enig-btn-unlock").addEventListener("click", taxCheckCodigo);

  taxUpdateProgress();
}

function taxUpdateProgress(){
  document.querySelectorAll(".enig-pill").forEach(p => {
    const n = Number(p.dataset.p);
    p.classList.toggle("done", n < taxState.etapa);
    p.classList.toggle("on", n === taxState.etapa);
  });
}

function taxMarkSolved(n){
  const st = document.getElementById(`enig-stage-${n}`);
  st.classList.add("solved");
  const tag = st.querySelector(".enig-stage-tag");
  tag.textContent = "✅ " + tag.textContent.replace(/^(🔒|🔓)\s*/u, "");
}

function taxUnlockStage(n){
  taxMarkSolved(n - 1);
  taxState.etapa = n;
  const st = document.getElementById(`enig-stage-${n}`);
  st.classList.remove("locked");
  const tag = st.querySelector(".enig-stage-tag");
  tag.textContent = tag.textContent.replace("🔒 ", "🔓 ");
  taxUpdateProgress();
  setTimeout(() => {
    st.scrollIntoView({ behavior: "smooth", block: "start" });
    const first = st.querySelector("input");
    if (first) first.focus({ preventScroll: true });
  }, 250);
}

/* ---------- ETAPA 1: LEITURA ---------- */
async function taxCheckPergunta(btn){
  const i = Number(btn.dataset.q);
  const msg = document.getElementById(`tax-msg-q-${i}`);
  const opts = document.getElementById(`tax-opts-${i}`);
  const hash = await taxSha256Hex(`q${i + 1}:${btn.dataset.v}`);

  if (hash === TAX_HASH_LEITURA[i]){
    btn.classList.add("right");
    opts.querySelectorAll(".enig-opt").forEach(b => b.disabled = true);
    const ultima = i === TAX_PERGUNTAS.length - 1;
    msg.textContent = ultima ? "✔ Leitura concluída! A segunda fechadura se abriu." : "✔ Isso mesmo!";
    msg.className = "enig-msg ok";
    if (ultima){
      setTimeout(() => taxUnlockStage(2), 700);
    } else {
      setTimeout(() => {
        const next = document.getElementById(`tax-q-${i + 1}`);
        next.classList.remove("hidden");
        next.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  } else {
    taxState.erros.leitura++;
    btn.classList.add("wrong");
    btn.disabled = true;
    taxShake(opts);
    msg.textContent = "Não é essa. " + TAX_PERGUNTAS[i].dica;
    msg.className = "enig-msg err";
  }
}

/* ---------- ETAPA 2: FUNÇÕES ---------- */
async function taxCheckFuncoes(){
  const msg = document.getElementById("enig-msg-2");
  const checks = document.getElementById("tax-checks");
  const marcadas = Array.from(checks.querySelectorAll("input:checked")).map(c => c.value).sort();

  if (marcadas.length < 2){
    msg.textContent = "A molécula é grande — tem mais de uma função. Marque todas as que encontrar.";
    msg.className = "enig-msg warn";
    return;
  }

  const hash = await taxSha256Hex(marcadas.join(","));
  if (hash === TAX_HASH_FUNCOES){
    checks.classList.add("done");
    checks.querySelectorAll("input").forEach(c => c.disabled = true);
    document.getElementById("tax-btn-funcoes").disabled = true;
    msg.textContent = "✔ Todas as funções identificadas! A terceira fechadura se abriu.";
    msg.className = "enig-msg ok";
    setTimeout(() => taxUnlockStage(3), 700);
    return;
  }

  taxState.erros.funcoes++;
  taxShake(checks);
  const n = taxState.erros.funcoes;
  let texto = "Ainda não. Revise: faltou alguma função ou há alguma marcada a mais.";
  if (n >= 2){
    const dica = marcadas.map(v => TAX_DICAS_FUNCOES[v]).find(Boolean);
    if (dica) texto = dica;
    else if (n >= 3) texto = "Faltam funções. Siga cada átomo de O e de N: OH em carbono que não é de anel aromático? " +
      "O entre dois carbonos (até dentro de um anel pequeno)? C=O entre dois carbonos? C=O ligado a O–C? C=O ligado a N?";
  }
  msg.textContent = texto;
  msg.className = "enig-msg err";
}

/* ---------- ETAPA 3: FÓRMULA + MASSA MOLAR ---------- */
async function taxCheckFormula(){
  const msg = document.getElementById("tax-msg-formula");
  const els = ["C", "H", "N", "O"];
  const vals = {};
  for (const el of els){
    const v = document.getElementById(`tax-f-${el}`).value.trim();
    if (!/^\d+$/.test(v)){
      msg.textContent = "Preencha os quatro números (só algarismos — se houver 1 átomo, digite 1).";
      msg.className = "enig-msg warn";
      return;
    }
    vals[el] = String(Number(v));
  }

  const certos = [];
  for (const el of els){
    const inp = document.getElementById(`tax-f-${el}`);
    const ok = (await taxSha256Hex(`${el}:${vals[el]}`)) === TAX_HASH_FORMULA[el];
    inp.classList.toggle("ok", ok);
    inp.classList.toggle("bad", !ok);
    if (ok) certos.push(el);
  }

  if (certos.length === els.length){
    els.forEach(el => document.getElementById(`tax-f-${el}`).disabled = true);
    document.getElementById("tax-btn-formula").disabled = true;
    msg.textContent = "✔ Fórmula correta! Agora calcule a massa molar.";
    msg.className = "enig-msg ok";
    const step = document.getElementById("tax-massa-step");
    step.classList.remove("hidden");
    setTimeout(() => {
      step.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("tax-input-mm").focus({ preventScroll: true });
    }, 300);
    return;
  }

  taxState.erros.formula++;
  taxShake(document.querySelector(".enig-formula-inputs"));
  const errados = els.filter(e => !certos.includes(e));
  let texto = `Confira o(s) elemento(s) em vermelho: ${errados.join(", ")}.`;
  if (errados.includes("H") && taxState.erros.formula >= 2){
    texto += " O H é o mais trabalhoso: conte os H de cada anel benzênico, de cada CH₃, dos OH e do NH, " +
      "e depois os H implícitos de cada carbono do esqueleto.";
  } else if (errados.includes("C") && taxState.erros.formula >= 2){
    texto += " Não esqueça os carbonos das metilas (CH₃) e os dos grupos acetila (CH₃–C=O).";
  } else if (errados.includes("O") && taxState.erros.formula >= 2){
    texto += " Conte também o O do anel de 4 membros e os dois O de cada grupo éster.";
  }
  msg.textContent = texto;
  msg.className = "enig-msg err";
}

async function taxCheckMassa(){
  const input = document.getElementById("tax-input-mm");
  const msg = document.getElementById("tax-msg-mm");
  const raw = input.value.trim().replace(",", ".");
  const val = Number(raw);
  if (!raw || !isFinite(val)){
    msg.textContent = "Digite um número (pode usar vírgula).";
    msg.className = "enig-msg warn";
    return;
  }
  const hash = await taxSha256Hex(String(Math.round(val)));
  if (TAX_HASH_MASSA.includes(hash)){
    input.disabled = true;
    document.getElementById("tax-btn-mm").disabled = true;
    msg.textContent = "✔ Massa molar correta! Agora vem o fogo…";
    msg.className = "enig-msg ok";
    setTimeout(() => taxUnlockStage(4), 700);
  } else {
    taxState.erros.massa++;
    taxShake(input);
    msg.textContent = taxState.erros.massa >= 2
      ? "Ainda não. Multiplique a quantidade de cada elemento pela sua massa atômica e some tudo (C×12 + H×1 + N×14 + O×16)."
      : "Valor incorreto. Revise a conta com as massas atômicas.";
    msg.className = "enig-msg err";
  }
}

/* ---------- ETAPA 5: CÓDIGO ---------- */
function taxSetupDigits(){
  const inputs = Array.from(document.querySelectorAll(".enig-digit"));
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 1);
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener("keydown", (ev) => {
      if (ev.key === "Backspace" && !inp.value && i > 0) inputs[i - 1].focus();
      if (ev.key === "Enter") taxCheckCodigo();
    });
  });
}

async function taxCheckCodigo(){
  const inputs = Array.from(document.querySelectorAll(".enig-digit"));
  const code = inputs.map(i => i.value).join("");
  const msg = document.getElementById("enig-msg-5");
  const safe = document.getElementById("enig-safe");

  if (code.length < TAX_CODE_LEN){
    msg.textContent = `Digite os ${TAX_CODE_LEN} algarismos do código.`;
    msg.className = "enig-msg warn";
    return;
  }

  const hash = await taxSha256Hex(code);
  if (hash === TAX_HASH_CODIGO){
    safe.classList.add("unlocked");
    safe.querySelector(".enig-lock-icon").textContent = "🔓";
    msg.textContent = "🔓 Código aceito! O segredo do teixo foi decifrado.";
    msg.className = "enig-msg ok";
    inputs.forEach(i => i.disabled = true);
    document.getElementById("enig-btn-unlock").disabled = true;
    taxMarkSolved(5);
    taxState.etapa = 6;
    taxUpdateProgress();
    setTimeout(renderTaxFinal, 900);
  } else {
    taxState.erros.codigo++;
    taxShake(safe.querySelector(".enig-digits"));
    msg.textContent = TAX_DICAS_CODIGO[hash] || "Código incorreto. Revise o balanceamento (C, H, N e O) e a conta da expressão.";
    msg.className = "enig-msg err";
    inputs.forEach(i => { i.value = ""; });
    inputs[0].focus();
  }
}

/* ---------- TELA FINAL + REGISTRO ---------- */
function renderTaxFinal(){
  const e = taxState.erros;
  const totalErros = e.leitura + e.funcoes + e.formula + e.massa + e.codigo;
  const minutos = ((Date.now() - taxState.inicio) / 60000).toFixed(1).replace(".", ",");
  const box = document.getElementById("enig-result");
  box.innerHTML = `
    <div class="enig-card">
      <div class="enig-final">
        <span class="big">🌲</span>
        <strong>Missão cumprida, ${taxState.name.split(" ")[0]}!</strong><br>
        <span class="enig-sub">“Sua crença é valiosa, então deve prestar atenção em onde a coloca.”</span><br>
        <span class="enig-sub">Tempo: ${minutos} min · erros no caminho: ${totalErros}</span>
        <span class="enig-registered" id="enig-reg-status">📝 Registrando na planilha…</span>
      </div>
      <div class="enig-ava">
        <strong class="ava-title">⚠️ ATENÇÃO: SÓ SERÁ COMPUTADO SE VOCÊ COLOCAR NO AVA:</strong>
        <ul>
          <li>o <strong>desenho da molécula de Taxol</strong> (paclitaxel), feito por você;</li>
          <li><strong>circuladas todas as funções orgânicas</strong> da molécula, com o nome de cada uma;</li>
          <li>os <strong>cálculos da combustão</strong>: o balanceamento da equação e a conta da expressão até o código.</li>
        </ul>
      </div>
    </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "start" });

  const statusEl = document.getElementById("enig-reg-status");
  if (typeof ENIGMA_TAXOL_WEBAPP_URL === "undefined" || !ENIGMA_TAXOL_WEBAPP_URL){
    statusEl.textContent = "Registro em planilha não configurado — mostre esta tela ao professor.";
    return;
  }

  fetch(ENIGMA_TAXOL_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tipo: "enigma_taxol",
      nome: taxState.name,
      turma: taxState.turma,
      dataHora: new Date().toLocaleString("pt-BR"),
      errosLeitura: e.leitura,
      errosFuncoes: e.funcoes,
      errosFormula: e.formula,
      errosMassa: e.massa,
      errosCodigo: e.codigo,
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

document.addEventListener("DOMContentLoaded", initEnigmaTaxol);
