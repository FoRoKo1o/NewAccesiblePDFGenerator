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
      return res.status(400).json({
        status: "error",
        message: "Nie przesłano pliku PDF."
      });
    }

    const pdfPath = req.file.path;

    let report;

    try {
      // to NIE rzuci wyjątku przy PDF UA niezgodnym — zwróci success: true/false
      report = await checkPdfCompliance(pdfPath);
    } catch (e) {
      // prawdziwy wyjątek (np. brak JSON, błąd programu)
      report = {
        success: false,
        error: e.error || e.message || "veraPDF processing failed",
        details: e
      };
    }

    // usuń plik temp
    await fs.unlink(pdfPath);

    // zwróć raport veraPDF
    return res.json(report);

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
      error: err
    });
  }
});

export default router;
