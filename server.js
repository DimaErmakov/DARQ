import express from "express";

const app = express();

// ===== Configuration =====
const links = [
  "https://photos.google.com/photo/AF1QipN4rfu7S77GL_iuWb-5NJEnx0Mm5xH8bPzYaju8",
  "https://photos.google.com/photo/AF1QipO1oTaPDJw9PQTnVk_NcWZ07bXjBoHUN54jRLv1",
];

// Change link every 10 seconds (adjust as needed)
const SWITCH_INTERVAL_MS = 10000;

// ===== State Tracking =====
let currentIndex = 0;
setInterval(() => {
  currentIndex = (currentIndex + 1) % links.length;
  console.log("Switched redirect to:", links[currentIndex]);
}, SWITCH_INTERVAL_MS);

// ===== Redirect Logic =====
app.get("/redirect", (req, res) => {
  const destination = links[currentIndex];
  console.log("Redirecting to:", destination);
  res.redirect(destination);
});

// ===== Start Server =====
app.listen(3000, () => {
  console.log("Redirect service running on port 3000");
  console.log(`Currently pointing to: ${links[currentIndex]}`);
  console.log(`Will switch every ${SWITCH_INTERVAL_MS / 1000} seconds.`);
});
