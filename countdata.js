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

// Comprehensive bot detection function
function isBot() {
  const ua = navigator.userAgent.toLowerCase();
  
  // Common bot patterns
  const botPatterns = [
    'facebookexternalhit',
    'facebot',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'discordbot',
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'baiduspider',
    'slurp',
    'exabot',
    'msnbot',
    'ahrefsbot'
  ];
  
  // Check if user agent matches any bot pattern
  const isBot = botPatterns.some(bot => ua.includes(bot));
  
  // Additional checks for common bot characteristics
  const hasWebDriver = navigator.webdriver;
  const hasChrome = window.chrome;
  const languages = navigator.languages;
  
  // If it has webdriver (automated browser) or no languages detected, likely a bot
  if (hasWebDriver || !languages || languages.length === 0) {
    return true;
  }
  
  // Check for headless browser patterns
  if (ua.includes('headless') || ua.includes('phantomjs')) {
    return true;
  }
  
  return isBot;
}

const SITE_NAME = window.location.hostname.replace(/\./g, "-");
const today = new Date().toISOString().slice(0, 10);
const siteRef = ref(db, `sites/${SITE_NAME}/${today}`);

const clientId = getClientId();
const referrer = document.referrer || "Direct";

// Check if it's a bot
const botDetected = isBot();

console.log('User Agent:', navigator.userAgent);
console.log('Is Bot:', botDetected);

// ONLY count if it's NOT a bot
if (!botDetected) {
  runTransaction(siteRef, (currentData) => {
    if (currentData === null) {
      return {
        total: 1,
        unique: 1,
        visitors: { 
          [clientId]: { 
            lastRef: referrer, 
            time: new Date().toISOString(),
            userAgent: navigator.userAgent 
          } 
        }
      };
    } else {
      currentData.total = (currentData.total || 0) + 1;
      
      // Only count as unique if this client hasn't visited today
      if (!currentData.visitors || !currentData.visitors[clientId]) {
        currentData.unique = (currentData.unique || 0) + 1;
      }

      if (!currentData.visitors) currentData.visitors = {};
      currentData.visitors[clientId] = { 
        lastRef: referrer, 
        time: new Date().toISOString(),
        userAgent: navigator.userAgent 
      };
      return currentData;
    }
  }).then((result) => {
    console.log('Visitor counted successfully');
  }).catch((error) => {
    console.error('Error counting visitor:', error);
  });
} else {
  console.log('Bot detected - not counting this visit');
  
  // Optional: Track bots separately if you want to monitor them
  const botRef = ref(db, `bots/${SITE_NAME}/${today}`);
  runTransaction(botRef, (currentData) => {
    if (currentData === null) {
      return {
        count: 1,
        bots: { [clientId]: { userAgent: navigator.userAgent, time: new Date().toISOString() } }
      };
    } else {
      currentData.count = (currentData.count || 0) + 1;
      if (!currentData.bots) currentData.bots = {};
      currentData.bots[clientId] = { userAgent: navigator.userAgent, time: new Date().toISOString() };
      return currentData;
    }
  });
}
