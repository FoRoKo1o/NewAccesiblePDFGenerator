import express from "express";
import bodyParser from "body-parser";
import generateRoute from "./routes/generate.js";
import checkPdf from "./routes/checkPdf.js";
import fs from "fs";
import path from "path";
import { checkPdfCompliance } from "./utils/checkPdfCompliance.js";
import { generatePDF, generateTestPdf } from "./utils/generatePDF.js";
import { fixAnnotations } from "./utils/fixAnnotations.js";


const app = express();
app.use(bodyParser.json());

app.use("/generate", generateRoute);
app.use("/check-pdf", checkPdf);


// hardcoded PDF generation and annotation fixing
app.get("/generate-test", async (req, res) => {
  try {
    const pdfPath = await generateTestPdf();
    const fixedPath = pdfPath.replace(".pdf", "_fixed.pdf");

    await fixAnnotations(pdfPath, fixedPath);

    return res.json({
      status: "success",
      message: "PDF wygenerowany",
      path: fixedPath
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.stderr?.toString() || err.message || "internal error"
    });
  }
});

// hardcoded PDF compliance check
app.get("/check-test", async (req, res) => {
  const pdfPath = path.resolve("./src/output/test_report.pdf");
  if (!fs.existsSync(pdfPath)) {
    return res
      .status(404)
      .json({ status: "error", message: "Plik test_report.pdf nie istnieje - wygeneruj go najpierw." });
  }

  const report = await checkPdfCompliance(pdfPath);
  res.json(report);
});


app.listen(3000, "127.0.0.1", () =>
  console.log("✅ Local test server running on http://127.0.0.1:3000")
);