const Document = require("../models/Document");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

const extractDocxText = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};
const extractTxtText = (buffer) => {
  return buffer.toString();
};

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const docs = [];

    for (const file of req.files) {
      let content = "";

      if (file.mimetype === "application/pdf") {
        content = await extractPdfText(file.buffer);
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        content = await extractDocxText(file.buffer);
      } else if (file.mimetype === "text/plain") {
        content = extractTxtText(file.buffer);
      } else {
        continue;
      }

      content = content.replace(/\s+/g, " ").trim();

      if (!content) continue;

      docs.push({
        fileName: file.originalname,
        content,
        lastModified: new Date(),
      });
    }

    if (docs.length === 0) {
      return res.status(400).json({ error: "No valid files to process" });
    }

    await Document.insertMany(docs, { ordered: false });

    res.json({
      message: `${docs.length} file(s) uploaded successfully`,
      uploadedCount: docs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const files = await Document.find().sort({ lastModified: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchFiles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await Document.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadTextFiles = async (req, res) => {
  try {
    const { text, fileName } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const doc = await Document.create({
      fileName: fileName || "manual-entry.txt",
      content: text,
      lastModified: new Date(),
    });

    res.json({
      message: "Text uploaded successfully",
      doc,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
