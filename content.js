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
let debounceTime = 5000;
let sentenceFragments = [];
//variaveis
async function processFinal() {
  if (sentenceFragments.length === 0) {
    return;
  }

  const fullSentence = sentenceFragments.join(" ");
  sentenceFragments = [];

  const traducao = await traduzirTexto(fullSentence);

  console.log("Frase cozinhada:", traducao);
} // funcao que chama a traducao com o texto novo

const callbackDoVigia = (mutationsList, observer) => {
  setTimeout(() => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          const textoDaLegenda = node.textContent;

          if (textoDaLegenda && textoDaLegenda.trim() !== "") {
            sentenceFragments.push(textoDaLegenda.trim());

            processFinal();
          }
        });
      }
    }
  }, debounceTime);
}; // adiciona no array sentenceFragments e dps chama o processFinal

function injetarNoChat(textoParaSerEnviado) {

}
const iniciarVigia = () => {
  const targetNode = document.querySelector(SELETOR_ALVO_PAI);

  if (targetNode) {
    console.log(
      'Alvo PAI ([aria-label="Legendas"]) encontrado! Iniciando o vigia...'
    );

    const config = { childList: true, subtree: true };

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


/*  Seletor CSS do textarea e do button: 

aria-label="Enviar uma mensagem" // do textarea
------------ = ------------
aria-label="Enviar uma mensagem" // do button 
*/