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

// Facebook bot detect
const ua = navigator.userAgent.toLowerCase();
const isFacebookBot = /facebookexternalhit|facebot/.test(ua);

// If it's a Facebook bot, don't count anything
if (isFacebookBot) {
  console.log("Facebook bot detected - not counting this visit");
} else {
  // Only count real human visitors
  runTransaction(siteRef, (currentData) => {
    if (currentData === null) {
      return {
        total: 1,
        unique: 1,
        visitors: { [clientId]: { lastRef: referrer, time: new Date().toISOString() } }
      };
    } else {
      currentData.total = (currentData.total || 0) + 1;
      
      // Only count as unique if this client hasn't visited today
      if (!currentData.visitors[clientId]) {
        currentData.unique = (currentData.unique || 0) + 1;
      }

      if (!currentData.visitors) currentData.visitors = {};
      currentData.visitors[clientId] = { lastRef: referrer, time: new Date().toISOString() };
      return currentData;
    }
  });
}
