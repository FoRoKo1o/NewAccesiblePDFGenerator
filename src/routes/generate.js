import express from "express";
import fs from "fs";
import { generatePDF } from "../utils/generatePDF.js";
import { fixAnnotations } from "../utils/fixAnnotations.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { template, data } = req.body;

    // Validacja
    if (!template || !data) {
      return res.status(400).json({
        status: "error",
        message: "Brakuje 'template' lub 'data' w body"
      });
    }

    // Generuj PDF z weryfikacją
    const options = {
      checkHTMLAccessibility: true,
      checkLanguage: true,
      checkPDFAccessibility: true
    };

    const [pdfPath, HTMLreport, language, pdfAccesibilityCheck] = await generatePDF(
      template,
      data,
      options
    );

    // Napraw anotacje
    const fixedPath = pdfPath.replace(".pdf", "_fixed.pdf");
    await fixAnnotations(pdfPath, fixedPath);

    // Zakoduj PDF na base64
    const pdfBuffer = fs.readFileSync(fixedPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    return res.json({
      status: "success",
      message: "PDF wygenerowany i zweryfikowany",
      pdfBase64,
      htmlReport: HTMLreport,
      languageCheck: language,
      pdfAccesibilityCheck: pdfAccesibilityCheck
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.stderr?.toString() || err.message || "internal error"
    });
  }
});

export default router;
