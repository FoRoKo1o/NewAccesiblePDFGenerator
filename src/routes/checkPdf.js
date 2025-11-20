import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { checkPdfCompliance } from "../utils/checkPdfCompliance.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/output/");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `uploaded_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "Nie przesłano pliku PDF." });
    }

    const pdfPath = req.file.path;
    const report = await checkPdfCompliance(pdfPath);

    await fs.unlink(pdfPath);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
