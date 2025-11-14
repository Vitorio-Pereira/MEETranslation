importScripts(
  "./firebase/firebase-app-compat.js",
  "./firebase/firebase-firestore-compat.js"
);

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == "SAVE_TO_FIREBASE") {
    console.log("ESCRITÓRIO CENTRAL: Recebi ordem para salvar:", message.data);
    try {
      db.collection("Texto_Traduzido")
        .add({
          original: message.data.original,
          traducao: message.data.traducao,
          timestamp: new Date(),
        })
        .then((docRef) => {
          console.log("Dados salvos com o id:", docRef.id);
        });
    } catch (e) {
      console.error("ESCRITÓRIO CENTRAL: Erro ao salvar no Firebase:", e);
    }
  }
  return true;
});
