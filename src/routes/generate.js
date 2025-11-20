import express from "express";
import { generatePDF } from "../utils/generatePDF.js";
import { checkHTMLAccessibility } from "../utils/checkHTMLAccessibility.js";
import { checkLanguage } from "../utils/checkLanguage.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { template, data } = req.body;
    const pdfPath = await generatePDF(template, data);
    const HTMLreport = await checkHTMLAccessibility(template, data);
    const language = await checkLanguage(data);

    res.json({
      status: "success",
      pdf_url: pdfPath,
      HTMLreport: HTMLreport,
      language: language
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
