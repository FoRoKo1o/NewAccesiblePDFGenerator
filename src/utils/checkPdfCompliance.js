import { exec } from "child_process";
import path from "path";

export const checkPdfCompliance = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(pdfPath);
    const command = `/usr/local/bin/verapdf -f ua1 --format json "${absPath}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {

      // ZAWSZE próbuj parsować stdout (veraPDF zwraca JSON nawet gdy exit code = 1)
      if (stdout && stdout.trim().startsWith("{")) {
        try {
          const json = JSON.parse(stdout);
          return resolve({
            success: true,          
            veraPDF: json,
            exitCode: err ? err.code : 0,
          });
        } catch (e) {
          return reject({
            success: false,
            error: "Failed to parse veraPDF JSON",
            message: e.message,
            raw: stdout,
          });
        }
      }

      return reject({
        success: false,
        error: "veraPDF execution failed",
        stderr,
        exitCode: err ? err.code : "unknown",
      });
    });
  });
};
