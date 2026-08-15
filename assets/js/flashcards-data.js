/* ============================================================
   Banco de Flashcards por tópico
   Química Orgânica I — Técnico, IFRO Ji-Paraná
   Cada item: { q, a }
   ============================================================ */

const FLASHCARDS = {

  cadeias: [
    { q: "O que é um carbono primário?", a: "É o carbono ligado a apenas um outro átomo de carbono." },
    { q: "O que é um carbono quaternário?", a: "É o carbono ligado a quatro outros átomos de carbono." },
    { q: "Diferença entre cadeia aberta (acíclica) e cadeia fechada (cíclica)?", a: "Cadeia aberta tem extremidades livres; cadeia fechada forma um ciclo, sem extremidades livres." },
    { q: "O que é uma cadeia homogênea?", a: "É a cadeia carbônica que contém apenas átomos de carbono na sequência principal, sem heteroátomos intercalados." },
    { q: "O que é uma cadeia heterogênea?", a: "É a cadeia que apresenta um heteroátomo (O, N, S etc.) intercalado entre os carbonos da sequência." },
    { q: "Como se representa a fórmula estrutural condensada do etanol?", a: "CH₃-CH₂-OH." },
    { q: "O que mostra a fórmula molecular, e o que ela não mostra?", a: "Mostra o tipo e a quantidade de átomos (ex.: C₂H₆O), mas não mostra como estão ligados nem a geometria da molécula." },
    { q: "O que é uma cadeia saturada?", a: "É a cadeia que possui apenas ligações simples entre os átomos de carbono." }
  ],

  hidrocarbonetos: [
    { q: "Qual o sufixo usado na nomenclatura de alcanos?", a: "-ano (ex.: metano, etano, propano)." },
    { q: "Qual o sufixo usado na nomenclatura de alcenos?", a: "-eno, indicando uma ligação dupla entre carbonos (ex.: propeno)." },
    { q: "Qual o sufixo usado na nomenclatura de alcinos?", a: "-ino, indicando uma ligação tripla entre carbonos (ex.: propino)." },
    { q: "Como se numera a cadeia principal para dar os menores localizadores?", a: "Numera-se a partir da extremidade mais próxima da insaturação, ramificação ou grupo funcional, escolhendo o sentido que gera os menores números possíveis." },
    { q: "Como se nomeia o CH₄?", a: "Metano." },
    { q: "Como se nomeia o CH₃-CH=CH₂?", a: "Propeno (prop-1-eno)." },
    { q: "O que é um cicloalcano e como se indica na nomenclatura?", a: "É um alcano de cadeia fechada; usa-se o prefixo 'ciclo' antes do nome do alcano correspondente (ex.: ciclohexano)." },
    { q: "Como nomear ramificações (grupos alquila) que saem da cadeia principal?", a: "Usam-se prefixos numéricos indicando a posição, seguidos do nome do grupo alquila (ex.: metil, etil), em ordem alfabética quando há mais de um." }
  ],

  alcoois: [
    { q: "Qual o grupo funcional característico dos álcoois?", a: "A hidroxila (-OH) ligada a um carbono saturado." },
    { q: "Qual o sufixo de nomenclatura oficial dos álcoois?", a: "-ol (ex.: metanol, etanol, propan-1-ol)." },
    { q: "Como se classifica um álcool primário, secundário e terciário?", a: "Pelo número de carbonos ligados diretamente ao carbono que porta a hidroxila: 1 (primário), 2 (secundário) ou 3 (terciário)." },
    { q: "Por que álcoois de cadeia curta são solúveis em água?", a: "Porque a hidroxila forma ligações de hidrogênio com a água, o que compensa a parte apolar da cadeia carbônica quando ela é curta." },
    { q: "O que é um poliol?", a: "Um álcool com duas ou mais hidroxilas na cadeia (ex.: etilenoglicol, glicerol)." },
    { q: "Por que álcoois têm ponto de ebulição maior que hidrocarbonetos de massa molar semelhante?", a: "Porque fazem ligações de hidrogênio entre si, exigindo mais energia para a mudança de fase." },
    { q: "Qual a fórmula estrutural do etanol?", a: "CH₃-CH₂-OH." }
  ],

  fenois: [
    { q: "O que caracteriza estruturalmente um fenol?", a: "A hidroxila (-OH) ligada diretamente a um carbono de anel aromático." },
    { q: "Por que os fenóis são mais ácidos que os álcoois?", a: "Porque o ânion fenóxido formado é estabilizado por ressonância com o anel aromático, o que não ocorre no alcóxido dos álcoois." },
    { q: "O que é um enol?", a: "Um composto com hidroxila ligada a um carbono de dupla ligação (C=C-OH)." },
    { q: "Qual a relação entre enóis e compostos carbonílicos?", a: "Enóis e suas formas carbonílicas (aldeído/cetona) são tautômeros, isômeros que se interconvertem rapidamente (tautomeria ceto-enólica)." },
    { q: "Qual o composto fenólico mais simples, usado como antisséptico?", a: "O fenol (hidroxibenzeno), C₆H₅-OH." },
    { q: "Fenóis reagem com hidróxido de sódio (NaOH)? Por quê?", a: "Sim, por serem ácidos o suficiente para reagir com base forte, formando o fenolato de sódio e água." }
  ],

  eteres: [
    { q: "Qual o grupo funcional característico dos éteres?", a: "Um átomo de oxigênio ligado a dois grupos carbônicos (R-O-R')." },
    { q: "Como se nomeia um éter pela nomenclatura oficial (IUPAC)?", a: "Usa-se o prefixo 'oxi' com o nome do menor grupo, seguido do nome da cadeia principal (ex.: metoxietano para CH₃-O-CH₂-CH₃)." },
    { q: "Éteres fazem ligação de hidrogênio entre suas próprias moléculas?", a: "Não, pois não possuem hidrogênio ligado diretamente ao oxigênio; por isso têm ponto de ebulição menor que álcoois de massa semelhante." },
    { q: "Por que os éteres são bons solventes para reações orgânicas?", a: "Por serem relativamente inertes (baixa reatividade química) e conseguirem dissolver compostos orgânicos apolares e moderadamente polares." },
    { q: "Qual éter foi historicamente usado como anestésico?", a: "O éter etílico (dietil éter, CH₃-CH₂-O-CH₂-CH₃)." },
    { q: "Éteres e álcoois de mesma fórmula molecular são exemplos de que tipo de isomeria?", a: "Isomeria de função (ex.: etanol e dimetil éter, ambos C₂H₆O)." }
  ],

  carbonilas: [
    { q: "Qual o grupo funcional comum a aldeídos e cetonas?", a: "A carbonila (C=O)." },
    { q: "Como diferenciar estruturalmente um aldeído de uma cetona?", a: "No aldeído, a carbonila está numa extremidade da cadeia, ligada a pelo menos um hidrogênio; na cetona, a carbonila está entre dois carbonos, no interior da cadeia." },
    { q: "Qual o sufixo de nomenclatura dos aldeídos?", a: "-al (ex.: metanal, etanal, propanal)." },
    { q: "Qual o sufixo de nomenclatura das cetonas?", a: "-ona (ex.: propanona, butanona)." },
    { q: "Qual o nome usual da propanona?", a: "Acetona." },
    { q: "Por que aldeídos são mais facilmente oxidados que cetonas?", a: "Porque o hidrogênio ligado à carbonila do aldeído é facilmente removido na oxidação a ácido carboxílico; a cetona não possui esse hidrogênio disponível." },
    { q: "O metanal (formaldeído) é usado industrialmente para quê?", a: "Como conservante (formol) e na produção de resinas sintéticas." }
  ],

  "acidos-esteres": [
    { q: "Qual o grupo funcional dos ácidos carboxílicos?", a: "A carboxila (-COOH), combinação de carbonila e hidroxila no mesmo carbono." },
    { q: "Qual o sufixo de nomenclatura dos ácidos carboxílicos?", a: "Ácido -oico (ex.: ácido metanoico, ácido etanoico)." },
    { q: "Qual o nome usual do ácido etanoico?", a: "Ácido acético, presente no vinagre." },
    { q: "Por que os ácidos carboxílicos têm ponto de ebulição elevado?", a: "Porque formam pares de ligações de hidrogênio entre duas moléculas (dímeros), exigindo mais energia para separá-las." },
    { q: "Qual o grupo funcional dos ésteres?", a: "O grupo éster (-COO-), formado pela reação entre um ácido carboxílico e um álcool." },
    { q: "Como se nomeia um éster?", a: "Nome do ácido de origem terminado em '-ato', seguido de 'de' e o nome do grupo derivado do álcool (ex.: etanoato de metila)." },
    { q: "Qual reação forma um éster a partir de um ácido carboxílico e um álcool, com eliminação de água?", a: "A esterificação (reação de Fischer)." },
    { q: "Ésteres de cadeia curta são frequentemente associados a quê?", a: "Aromas e essências de frutas, muito usados na indústria alimentícia e de perfumaria." }
  ],

  nitrogenadas: [
    { q: "Qual o grupo funcional das aminas?", a: "O nitrogênio trivalente ligado a um ou mais grupos carbônicos (R-NH₂, R₂NH ou R₃N)." },
    { q: "Como se classificam as aminas primária, secundária e terciária?", a: "Pelo número de grupos carbônicos ligados ao nitrogênio: 1 (primária), 2 (secundária) ou 3 (terciária)." },
    { q: "Qual o grupo funcional das amidas?", a: "A carbonila ligada a um nitrogênio (-CO-NH₂ ou variações substituídas)." },
    { q: "Qual o sufixo de nomenclatura das amidas?", a: "-amida (ex.: metanamida, etanamida)." },
    { q: "Qual o grupo funcional das nitrilas?", a: "O grupo ciano (-C≡N), com carbono e nitrogênio unidos por tripla ligação." },
    { q: "Como se nomeia uma nitrila?", a: "Nome do hidrocarboneto correspondente com sufixo '-nitrila' (ex.: etanonitrila), incluindo o carbono do grupo -CN na contagem da cadeia." },
    { q: "O que caracteriza um nitrocomposto?", a: "A presença do grupo nitro (-NO₂) ligado a um carbono." },
    { q: "Aminas são compostos básicos ou ácidos? Por quê?", a: "Básicos, pois o par de elétrons não ligante do nitrogênio pode aceitar um próton (H⁺)." }
  ]
};
