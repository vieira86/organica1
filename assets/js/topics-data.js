/* ============================================================
   Metadados dos tópicos da disciplina
   Química Orgânica I — Técnico, IFRO Ji-Paraná
   ============================================================ */

const TOPICS = [
  {
    id: "cadeias",
    title: "Cadeias Carbônicas e Fórmulas",
    short: "Cadeias e Fórmulas",
    category: "Fundamentos",
    catClass: "teal",
    description: "Classificação de cadeias carbônicas e representação por fórmula estrutural, molecular e eletrônica (Lewis)."
  },
  {
    id: "hidrocarbonetos",
    title: "Hidrocarbonetos e Nomenclatura IUPAC",
    short: "Hidrocarbonetos",
    category: "Nomenclatura",
    catClass: "violet",
    description: "Nomenclatura oficial de alcanos, alcenos, alcinos e cicloalcanos segundo as regras da IUPAC."
  },
  {
    id: "alcoois",
    title: "Álcoois",
    short: "Álcoois",
    category: "Função Oxigenada",
    catClass: "blue",
    description: "Classificação, nomenclatura e propriedades físico-químicas dos álcoois."
  },
  {
    id: "fenois",
    title: "Fenóis e Enóis",
    short: "Fenóis e Enóis",
    category: "Função Oxigenada",
    catClass: "blue",
    description: "Diferenças estruturais e de reatividade entre fenóis, enóis e álcoois."
  },
  {
    id: "eteres",
    title: "Éteres",
    short: "Éteres",
    category: "Função Oxigenada",
    catClass: "blue",
    description: "Estrutura, nomenclatura e propriedades dos éteres."
  },
  {
    id: "carbonilas",
    title: "Aldeídos e Cetonas",
    short: "Aldeídos e Cetonas",
    category: "Função Oxigenada",
    catClass: "amber",
    description: "Grupo carbonila: nomenclatura e propriedades de aldeídos e cetonas."
  },
  {
    id: "acidos-esteres",
    title: "Ácidos Carboxílicos e Ésteres",
    short: "Ácidos e Ésteres",
    category: "Função Oxigenada",
    catClass: "amber",
    description: "Nomenclatura e propriedades de ácidos carboxílicos e seus ésteres derivados."
  },
  {
    id: "nitrogenadas",
    title: "Funções Nitrogenadas",
    short: "Nitrogenadas",
    category: "Função Nitrogenada",
    catClass: "green",
    description: "Aminas, amidas, nitrilas e nitrocompostos: estrutura e nomenclatura."
  }
];

function getTopic(id){
  return TOPICS.find(t => t.id === id);
}
