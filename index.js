const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { runLighthouse } = require("./script");

const app = express();

app.get("/", async (req, res) => {
  try {
    await runLighthouse();
    res.send("Reports generated and analyzed.");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/summary", (req, res) => {
  const filePath = `${__dirname}/final_report.html`; // Use __dirname to get the current directory
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(data);
    }
  });
});

app.get("/reports/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "reports", fileName);
    const fileExists = await fsp
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      // Set the appropriate Content-Type header based on the file type
      const contentType =
        path.extname(fileName) === ".html"
          ? "text/html"
          : "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      // Stream the file to the response
      fs.createReadStream(filePath).pipe(res);
    } else {
      // File not found
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send("Internal Server Error");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
