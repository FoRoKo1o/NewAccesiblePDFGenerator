import axios from "axios";

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

    const resp = await axios.post(
      "https://api.logios.dev/public/calculate_measures",
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: "json"
      }
    );
    return resp.data;
  } catch (err) {
    if (err.response) {
      // Błąd z odpowiedzi serwera
      return { success: false, status: err.response.status, error: err.response.data };
    }
    return { success: false, error: err.message || String(err) };
  }
}
