const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../controllers/fileController");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
    }
  },
});

router.get("/files", controller.getAllFiles);
router.get("/search", controller.searchFiles);
router.post("/files", upload.array("files", 10), controller.uploadFiles);
router.post("/files-text", controller.uploadTextFiles);

module.exports = router;