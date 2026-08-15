/* ============================================================
   molecules-data.js — Banco de questões do Quiz de Moléculas
   Química Orgânica I — Técnico, IFRO Ji-Paraná

   Cada item:
   { level, levelTitle, draw: () => svgString, askType: "funcao"|"nome",
     question, options: [4], correct: index, explain }
   ============================================================ */

const MOL_LEVELS = [
  { n: 1, title: "Cadeias e Hidrocarbonetos" },
  { n: 2, title: "Álcoois, Fenóis e Éteres" },
  { n: 3, title: "Carbonilas, Ácidos e Ésteres" },
  { n: 4, title: "Funções Nitrogenadas" }
];

const MOLECULES = [

  // ---------- Nível 1 ----------
  {
    level: 1,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null}], [1,1], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Metano", "Etano", "Propano", "Butano"],
    correct: 2,
    explain: "Cadeia saturada de três carbonos, apenas ligações simples: propano."
  },
  {
    level: 1,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null}], [2,1], []),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Alcano", "Alceno", "Alcino", "Álcool"],
    correct: 1,
    explain: "A presença de uma ligação dupla entre carbonos caracteriza um alceno (propeno)."
  },
  {
    level: 1,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null},{label:null}], [3,1,1], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Butano", "But-1-eno", "But-1-ino", "Butan-1-ol"],
    correct: 2,
    explain: "Cadeia de quatro carbonos com uma ligação tripla na posição 1: but-1-ino."
  },
  {
    level: 1,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null},{label:null}], [1,2,1], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["But-1-eno", "But-2-eno", "Butano", "Butan-2-ona"],
    correct: 1,
    explain: "A dupla ligação está entre o 2º e o 3º carbono da cadeia: but-2-eno."
  },

  // ---------- Nível 2 ----------
  {
    level: 2,
    draw: () => renderChainSVG([{label:null},{label:null},{label:"OH"}], [1,1], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Etanol", "Propan-1-ol", "Propan-2-ol", "Propanal"],
    correct: 1,
    explain: "Hidroxila na extremidade de uma cadeia de 3 carbonos: propan-1-ol."
  },
  {
    level: 2,
    draw: () => renderBenzeneSVG("OH"),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Álcool", "Fenol", "Éter", "Ácido carboxílico"],
    correct: 1,
    explain: "A hidroxila ligada diretamente ao anel aromático caracteriza um fenol."
  },
  {
    level: 2,
    draw: () => renderChainSVG([{label:null},{label:null},{label:"O"},{label:null},{label:null}], [1,1,1,1], []),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Álcool", "Éster", "Éter", "Amina"],
    correct: 2,
    explain: "Um oxigênio ligado a dois grupos carbônicos, sem hidrogênio no oxigênio, é um éter (etoxietano)."
  },
  {
    level: 2,
    image: "assets/img/moléculas/molecula1.png",
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Álcool", "Éter", "Ácido carboxílico", "Amina"],
    correct: 0,
    explain: "A hidroxila (-OH) ligada a um carbono do anel, sem carbonila nem heteroátomo na cadeia, caracteriza um álcool (neste caso, cíclico e secundário: ciclooctanol)."
  },
  {
    level: 2,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null}], [1,1], [{from:1, dir:-1, order:1, label:"OH"}]),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Propan-1-ol", "Propan-2-ol", "Propanona", "Ácido propanoico"],
    correct: 1,
    explain: "A hidroxila está no carbono central (C2) de uma cadeia de 3 carbonos: propan-2-ol (álcool secundário)."
  },

  // ---------- Nível 3 ----------
  {
    level: 3,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null}], [1,1], [{from:2, dir:-1, order:2, label:"O"}]),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Aldeído", "Cetona", "Ácido carboxílico", "Éster"],
    correct: 0,
    explain: "A carbonila está na extremidade da cadeia (propanal): aldeído."
  },
  {
    level: 3,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null},{label:null}], [1,1,1], [{from:1, dir:-1, order:2, label:"O"}]),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Butan-1-ol", "Butan-2-ona", "Ácido butanoico", "Butanal"],
    correct: 1,
    explain: "Carbonila no interior da cadeia (C2), sem hidroxila: cetona, butan-2-ona."
  },
  {
    level: 3,
    draw: () => renderChainSVG([{label:null},{label:null}], [1], [{from:1, dir:-1, order:2, label:"O"}, {from:1, dir:1, order:1, label:"OH"}]),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Álcool", "Aldeído", "Ácido carboxílico", "Éster"],
    correct: 2,
    explain: "Carbonila e hidroxila no mesmo carbono terminal formam a carboxila (-COOH): ácido carboxílico."
  },
  {
    level: 3,
    draw: () => renderChainSVG([{label:null},{label:null},{label:"O"},{label:null}], [1,1,1], [{from:1, dir:-1, order:2, label:"O"}]),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Ácido etanoico", "Etanoato de metila", "Etanal", "Metanol"],
    correct: 1,
    explain: "Grupo éster (carbonila + oxigênio ligando a outro carbono): etanoato de metila."
  },

  // ---------- Nível 4 ----------
  {
    level: 4,
    draw: () => renderChainSVG([{label:null},{label:null},{label:"NH2"}], [1,1], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Metanamina", "Etanamina", "Propan-1-amina", "N-metiletanamina"],
    correct: 1,
    explain: "Grupo amina na extremidade de uma cadeia de 2 carbonos: etanamina (nome usual: etilamina)."
  },
  {
    level: 4,
    draw: () => renderChainSVG([{label:null},{label:null}], [1], [{from:1, dir:-1, order:2, label:"O"}, {from:1, dir:1, order:1, label:"NH2"}]),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Amina", "Amida", "Nitrila", "Ácido carboxílico"],
    correct: 1,
    explain: "Carbonila ligada a um nitrogênio caracteriza uma amida (etanamida)."
  },
  {
    level: 4,
    draw: () => renderChainSVG([{label:null},{label:null},{label:"N"}], [1,3], []),
    askType: "nome",
    question: "Qual o nome IUPAC deste composto?",
    options: ["Etanamina", "Etanonitrila", "Etanamida", "Nitroetano"],
    correct: 1,
    explain: "O grupo -C≡N (ciano) na extremidade caracteriza uma nitrila: etanonitrila."
  },
  {
    level: 4,
    draw: () => renderChainSVG([{label:null},{label:null},{label:null}], [1,1], [{from:2, dir:-1, order:1, label:"NO2"}]),
    askType: "funcao",
    question: "Qual a função orgânica deste composto?",
    options: ["Amina", "Amida", "Nitrocomposto", "Nitrila"],
    correct: 2,
    explain: "O grupo -NO₂ ligado ao carbono caracteriza um nitrocomposto (nitroetano)."
  }
];

function getMoleculesByLevel(level){
  return MOLECULES.filter(m => m.level === level);
}
