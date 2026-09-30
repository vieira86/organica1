/* ============================================================
   sheets-config.js — configuração do registro em Google Sheets
   Química Orgânica I — Técnico, IFRO Ji-Paraná

   Depois de publicar o Google Apps Script (veja o arquivo
   google-apps-script/Code.gs e o passo a passo em
   google-apps-script/COMO_CONFIGURAR.md na raiz desta pasta),
   cole aqui a URL do Web App gerada pelo Deploy.

   Exemplo: "https://script.google.com/macros/s/AKfycb.../exec"
   ============================================================ */

const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbze1GaNZ9wNt-mZrxS60VO1-U4NpabDvDJtAqG8IHxt3DOOM6obD7lk-e3Bf9DzWCY/exec";

const SHEETS_PLATFORM_NAME = "Química Orgânica I — Técnico";

/* ------------------------------------------------------------
   Enigma do Agente-Laranja — Web App SEPARADO (planilha própria).
   Veja google-apps-script/enigma-laranja/COMO_CONFIGURAR.md.
   Enquanto estiver vazio, o enigma funciona normalmente, mas não
   registra na planilha (o aluno vê um aviso para mostrar a tela).
   ------------------------------------------------------------ */
const ENIGMA_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyBfHeZGH3IAcMRhOcRnqNsRyPjpPwn5iheodAIyByqT8ZdniACWVfug_ICcy64X07P/exec";
