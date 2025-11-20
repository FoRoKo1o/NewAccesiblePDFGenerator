import express from "express";
import { generatePDF } from "../utils/generatePDF.js";
import { checkHTMLAccessibility } from "../utils/checkHTMLAccessibility.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { template, data } = req.body;
    const pdfPath = await generatePDF(template, data);
    const report = await checkHTMLAccessibility(template, data);

    res.json({
      status: "success",
      pdf_url: pdfPath,
      report
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
