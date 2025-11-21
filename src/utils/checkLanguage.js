import path from "path";

export async function checkLanguage(data) {
  // console.log(`checkLanguage ${data}`);
  try {
    const texts = [];

    const collect = (value) => {
      if (!value && value !== "") return;
      if (typeof value === "string") {
        const s = value.trim();
        if (s) texts.push(s);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(collect);
        return;
      }
      if (typeof value === "object") {
        for (const k of Object.keys(value)) {
          collect(value[k]);
        }
      }
    };

    collect(data);

    const text_str = texts.join("\n\n").slice(0, 100000);

    const payload = {
      text_str,
      text_type: (data && data.text_type) || "pismo",
      text_style: (data && data.text_style) || "urzędowy"
    };

    let _fetch = (typeof fetch !== "undefined") ? fetch : null;
    if (!_fetch) {
      const nf = await import("node-fetch");
      _fetch = nf.default;
    }

    const resp = await _fetch("https://api.logios.dev/public/calculate_measures", {
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