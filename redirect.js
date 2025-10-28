var links = [
  "https://cutl.io/link05-24-10-25",
  "https://cutl.io/link05-24-10-25",
  "https://cutl.io/link05-24-10-25",
  "https://cutl.io/link05-24-10-25",
  "https://cutl.io/link05-24-10-25"
];

var randomLink = links[Math.floor(Math.random() * links.length)];

window.onload = function() {
  window.location.replace(randomLink);
};
