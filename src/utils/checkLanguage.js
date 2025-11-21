import fetch from "node-fetch";

export async function checkLanguage(data) {
  try {
    const texts = [];

    const collectText = (value) => {
      if (!value && value !== "") return;

      if (typeof value === "string") {
        const s = value.trim();
        if (s && s.length > 5 && /[a-zA-Ząćęłńóśźż]/i.test(s)) {
          texts.push(s);
        }
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(collectText);
        return;
      }

      if (typeof value === "object") {
        for (const k of Object.keys(value)) {
          if (["image", "table", "caption", "alt"].includes(k)) continue;
          collectText(value[k]);
        }
      }
    };

    collectText(data);

    const text_str = texts.join("\n\n").slice(0, 100000);

    const payload = {
      text_str,
      text_type: data?.text_type || "pismo",
      text_style: data?.text_style || "urzędowy"
    };

    const resp = await fetch("https://api.logios.dev/public/calculate_measures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { success: false, status: resp.status, error: txt };
    }

    const json = await resp.json();
    return json;
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}
