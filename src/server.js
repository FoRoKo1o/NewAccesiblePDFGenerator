import express from "express";
import bodyParser from "body-parser";
import generateRoute from "./routes/generate.js";
import checkPdf from "./routes/checkPdf.js";
import fs from "fs";
import path from "path";
import { checkPdfCompliance } from "./utils/checkPdfCompliance.js";
import { generateTestPdf } from "./utils/generatePDF.js";
import { fixAnnotations } from "./utils/fixAnnotations.js";

const app = express();
app.use(bodyParser.json());

app.use("/generate", generateRoute);
app.use("/check-pdf", checkPdf);

// REMOVE THIS
// hardcoded PDF generation and annotation fixing
app.get("/generate-test", async (req, res) => {
  try {
    const [pdfPath, HTMLreport, language, pdfAccesibilityCheck] = await generateTestPdf();
    const fixedPath = pdfPath.replace(".pdf", "_fixed.pdf");

    await fixAnnotations(pdfPath, fixedPath);

    const pdfBuffer = fs.readFileSync(fixedPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    return res.json({
      status: "success",
      message: "PDF wygenerowany",
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


// REMOVE THIS
// hardcoded PDF compliance check
app.get("/check-test", async (req, res) => {
  const pdfPath = path.resolve("./src/output/test_report_fixed.pdf");
  if (!fs.existsSync(pdfPath)) {
    return res
      .status(404)
      .json({ status: "error", message: `Plik ${pdfPath} nie istnieje - wygeneruj go najpierw.` });
  }

  const report = await checkPdfCompliance(pdfPath);
  res.json(report);
});

app.listen(3000, "127.0.0.1", () =>
  console.log("✅ Local test server running on http://127.0.0.1:3000")
);