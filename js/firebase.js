import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// A configuração está ofuscada (Base64) para evitar leitura imediata por bots em repositórios abertos.
// NOTA: Em aplicações front-end SPA, chaves do Firebase ficam expostas no navegador de qualquer forma.
// A verdadeira segurança do seu banco de dados DEVE ser configurada no arquivo firestore.rules.
const _encConfig = "eyJhcGlLZXkiOiJBSXphU3lCanpRak9XLVRDSWoycGpLUnZ3bDVScHZBeHVRZ2Zxa0EiLCJhdXRoRG9tYWluIjoicG9saXNjb24uZmlyZWJhc2VhcHAuY29tIiwicHJvamVjdElkIjoicG9saXNjb24iLCJzdG9yYWdlQnVja2V0IjoicG9saXNjb24uZmlyZWJhc2VzdG9yYWdlLmFwcCIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiMjQzMjcwNDEyNDE1IiwiYXBwSWQiOiIxOjI0MzI3MDQxMjQxNTp3ZWI6Y2NhNzRmMjBhZWVlOTQxNzMzYjc0YSJ9";

const FORCE_OFFLINE = true; // Definir como true para rodar localmente com mocks

let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(atob(_encConfig));
} catch(e) {
  console.error("Erro ao decodificar config do Firebase", e);
}

// Inicializa o Firebase
let app, auth, db, secondaryApp, secondaryAuth;
if (FORCE_OFFLINE) {
    console.warn("Rodando em modo FORCE_OFFLINE com mocks locais.");
    app = null;
    auth = null;
    db = null;
    secondaryApp = null;
    secondaryAuth = null;
} else {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // App secundária para criar usuários sem deslogar o admin atual
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        secondaryAuth = getAuth(secondaryApp);
    } catch(e) {
        console.error("Firebase não configurado ou erro na inicialização.", e);
    }
}

export { 
    app, 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    serverTimestamp, 
    orderBy,
    secondaryAuth,
    createUserWithEmailAndPassword
};
