import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyCediRkFLFfRhnQWG9sCAEek_6-BMcNXXY",
  authDomain: "my-website-counter56.firebaseapp.com",
  projectId: "my-website-counter56",
  storageBucket: "my-website-counter56.appspot.com",
  messagingSenderId: "538008405213",
  appId: "1:538008405213:web:eed758b2a5d8466f944734",
  databaseURL: "https://my-website-counter56-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
function isBot() {
  const ua = navigator.userAgent.toLowerCase();
  return /bot|crawl|slurp|spider|mediapartners|google|bing|yandex|baidu/.test(ua);
}
function getClientId() {
  let cid = localStorage.getItem("visitor_id");
  if (!cid) {
    cid = Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem("visitor_id", cid);
  }
  return cid;
}
const SITE_NAME = window.location.hostname.replace(/\./g, "-");
const today = new Date().toISOString().slice(0, 10);
const siteRef = ref(db, `sites/${SITE_NAME}/${today}`);

const clientId = getClientId();
const referrer = document.referrer || "Direct";
const bot = isBot();
runTransaction(siteRef, (currentData) => {
  if (currentData === null) {
    return {
      total: 1,
      unique: bot ? 0 : 1,
      bots: bot ? 1 : 0,
      visitors: { [clientId]: { lastRef: referrer, bot, time: new Date().toISOString() } }
    };
  } else {
    currentData.total = (currentData.total || 0) + 1;
    if (bot) currentData.bots = (currentData.bots || 0) + 1;
    else if (!currentData.visitors || !currentData.visitors[clientId])
      currentData.unique = (currentData.unique || 0) + 1;

    if (!currentData.visitors) currentData.visitors = {};
    currentData.visitors[clientId] = { lastRef: referrer, bot, time: new Date().toISOString() };
    return currentData;
  }
});
