async function traduzirTexto(
  textoParaTraduzir,
  langOrig = "pt",
  langDest = "en"
) {
  let query = encodeURIComponent(textoParaTraduzir);
  let langPair = `${langOrig}|${langDest}`;
  let url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro de rede: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else {
      return `Erro ao traduzir: ${textoParaTraduzir}`;
    }
  } catch (error) {
    console.log("Erro ao chamar a api:", error);
    return textoParaTraduzir;
  }
} // funcao para traduzir o texto pego pela legenda

const SELETOR_ALVO_PAI = '[aria-label="Legendas"]';
const SELETOR_LEGENDA = ".ygicle";
let debounceTime = 6000;
let debounceTimer = null;
let sentenceFragments = [];
let lastSentence = ""; // A "Memória"
//variaveis
async function processFinal() {
  const SELETOR_FILTRO_LEGENDA = document.querySelectorAll(SELETOR_LEGENDA);
  if (SELETOR_FILTRO_LEGENDA.length == 0) {
    return;
  }

  let currentSentence = "";
  SELETOR_FILTRO_LEGENDA.forEach((node) => {
    currentSentence += node.textContent + " ";
  });

  currentSentence = currentSentence.trim();

  if (currentSentence === "" || currentSentence === lastSentence) {
    return;
  }
  let fraseParaTraduzir = "";

  if (currentSentence.startsWith(lastSentence)) {
    fraseParaTraduzir = currentSentence.substring(lastSentence.length).trim();
  } else {
    fraseParaTraduzir = currentSentence;
  }

  if (fraseParaTraduzir === "") {
    lastSentence = currentSentence; // Atualiza a memória mesmo assim
    return;
  }

  lastSentence = currentSentence;
  try {
    console.log("Frase para traduzir:", fraseParaTraduzir);
    const traducao = await traduzirTexto(fraseParaTraduzir);
    console.log("Tradução:", traducao);

    injetarNoChat(traducao);

    chrome.runtime.sendMessage({
      type: "SAVE_TO_FIREBASE",
      data: { original: fraseParaTraduzir, traducao: traducao },
    });
    fraseParaTraduzir = "";
  } catch (error) {
    console.error("erro no processo de traducao: ", error);
  }
} // funcao que chama a traducao com o texto novo

const callbackDoVigia = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processFinal, debounceTime);
};
function injetarNoChat(textoParaSerEnviado) {
  btnEnviar = document.querySelector(
    'button[aria-label="Enviar uma mensagem"]'
  );
  caixaDoTexto = document.querySelector(
    'textarea[aria-label="Enviar uma mensagem"]'
  );

  if (!btnEnviar || !caixaDoTexto) {
    console.error();
    return;
  }

  caixaDoTexto.value = textoParaSerEnviado;
  caixaDoTexto.dispatchEvent(new Event("input", { bubbles: true }));

  setTimeout(() => btnEnviar.click(), 100);
}

const iniciarVigia = () => {
  const targetNode = document.querySelector(SELETOR_ALVO_PAI);

  if (targetNode) {
    console.log(
      'Alvo PAI ([aria-label="Legendas"]) encontrado! Iniciando o vigia...'
    );

    const config = { childList: true, subtree: true, characterData: true };

    const observer = new MutationObserver(callbackDoVigia);

    observer.observe(targetNode, config);
  } else {
    console.log(
      'Alvo PAI ([aria-label="Legendas"]) nã o encontrado. Tentando de novo em 1s...'
    );
    setTimeout(iniciarVigia, 1000);
  }
}; // fica vigiando se algo foi mudado e assim que foi mudado ele comeca a observa e chamar a funcao

iniciarVigia();
