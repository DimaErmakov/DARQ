import express from "express";

const app = express();

// ===== Step 1: Define the redirect logic =====
app.get("/redirect", (req, res) => {
  const date = new Date();
  const month = 0; // For testing, change manually. Use date.getMonth() for dynamic.

  let destination = "https://example.com/default";

  if (month === 0) destination = "https://photos.google.com/photo/AF1QipN4rfu7S77GL_iuWb-5NJEnx0Mm5xH8bPzYaju8";
  else if (month === 1)
    destination =
      "https://photos.google.com/photo/AF1QipO1oTaPDJw9PQTnVk_NcWZ07bXjBoHUN54jRLv1";

  res.redirect(destination);
});

app.listen(3000, () => {
  console.log("Redirect service running on port 3000");
});
