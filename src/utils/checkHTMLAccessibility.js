import pa11y from "pa11y";
import hbs from "handlebars";
import fs from "fs/promises";
import path from "path";

export async function checkHTMLAccessibility(templateName, data) {
  // console.log(`Checking accessibility for template: ${templateName}`);
  const templatePath = path.resolve(`src/templates/${templateName}.hbs`);
  const source = await fs.readFile(templatePath, "utf-8");
  const template = hbs.compile(source);
  const html = template(data);

  const tmpPath = path.resolve(`src/output/tmp_${Date.now()}.html`);
  await fs.writeFile(tmpPath, html, "utf-8");

  try {
    const result = await pa11y(`file://${tmpPath}`, {
      standard: "WCAG2AA",
      chromeLaunchConfig: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage"
        ]
      }
    });

    await fs.unlink(tmpPath);

    return {
      html_accessibility_score: 1 - (result.issues.length / 20),
      issues_found: result.issues.map(i => i.message)
    };
  } catch (err) {
    await fs.unlink(tmpPath).catch(() => {});
    throw err;
  }
}
