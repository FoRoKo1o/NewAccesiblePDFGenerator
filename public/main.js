document.addEventListener("DOMContentLoaded", () => {
    const componentsContainer = document.getElementById("components-container");
    const generateBtn = document.getElementById("generateBtn");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const modalClose = document.getElementById("modal-close");

    modalClose.addEventListener("click", () => { modal.style.display = "none"; });

    function showModal(html) {
        modalContent.innerHTML = html;
        modal.style.display = "flex";
    }

    function addRemoveButton(component) {
        const btn = document.createElement("button");
        btn.textContent = "Usuń";
        btn.classList.add("remove-btn");
        btn.addEventListener("click", () => component.remove());
        component.appendChild(btn);
    }

    // Dodawanie komponentów
    document.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            let html = "";

            if (type === "heading") {
                html = `<div class="component" data-type="heading">
                  <label>Nagłówek: <span class="required">*</span></label>
                  <input type="text" class="heading-input" placeholder="Wpisz nagłówek…" required>
                </div>`;
            }

            if (type === "paragraph") {
                html = `<div class="component" data-type="paragraph">
                  <label>Paragraf: <span class="required">*</span></label>
                  <textarea class="paragraph-input" placeholder="Wpisz tekst paragrafu…" required></textarea>
                </div>`;
            }

            if (type === "list") {
                html = `<div class="component" data-type="list">
                  <label>Tytuł listy: <span class="required">*</span></label>
                  <input type="text" class="list-title" placeholder="np. Najważniejsze wnioski" required>
                  <label>Elementy listy (każdy w osobnej linii): <span class="required">*</span></label>
                  <textarea class="list-input" placeholder="Element 1\nElement 2\nElement 3" required></textarea>
                </div>`;
            }

            if (type === "table") {
                html = `<div class="component" data-type="table">
                  <label>Podpis tabeli: <span class="required">*</span></label>
                  <input type="text" class="table-caption" placeholder="np. Tabela 1. Wyniki finansowe" required>
                  <label>Nagłówki kolumn (oddzielone przecinkami): <span class="required">*</span></label>
                  <input type="text" class="table-headers" placeholder="Nazwa, Status, Uwagi" required>
                  <label>Wiersze (oddzielone przecinkami, każdy w osobnej linii): <span class="required">*</span></label>
                  <textarea class="table-rows" placeholder="Wiersz 1, Wartość, Wartość\nWiersz 2, Wartość, Wartość" required></textarea>
                </div>`;
            }

            if (type === "image") {
                html = `<div class="component" data-type="image">
                  <label>Adres URL obrazka: <span class="required">*</span></label>
                  <input type="text" class="image-src" placeholder="https://example.com/image.jpg" required>
                  <label>Tekst alternatywny (alt): <span class="required">*</span></label>
                  <input type="text" class="image-alt" placeholder="Opisz dokładnie co widać na obrazku" required>
                  <label>Podpis obrazka: <span class="required">*</span></label>
                  <input type="text" class="image-caption" placeholder="np. Rysunek 1. Opis" required>
                </div>`;
            }

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const component = tempDiv.firstChild;
            addRemoveButton(component);

            componentsContainer.appendChild(component);
        });
    });

    // VALIDACJA
    function validateComponent(component) {
        const type = component.dataset.type;
        const inputs = component.querySelectorAll("input, textarea");
        
        for (let input of inputs) {
            if (input.hasAttribute("required") && !input.value.trim()) {
                return {
                    valid: false,
                    message: `Pole "${input.previousElementSibling?.textContent || 'nieznane'}" jest wymagane!`
                };
            }
        }

        // Walidacja specificzna
        if (type === "image") {
            const src = component.querySelector(".image-src").value;
            const alt = component.querySelector(".image-alt").value;
            const caption = component.querySelector(".image-caption").value;

            if (alt.length < 5) {
                return { valid: false, message: "Tekst alternatywny musi mieć co najmniej 5 znaków!" };
            }
            if (caption.length < 10) {
                return { valid: false, message: "Podpis obrazka musi mieć co najmniej 10 znaków!" };
            }
        }

        if (type === "table") {
            const headers = component.querySelector(".table-headers").value.split(",").map(h => h.trim()).filter(Boolean);
            const rows = component.querySelector(".table-rows").value.split("\n").map(r => r.split(",").map(c => c.trim())).filter(r => r.some(c => c));

            if (headers.length < 2) {
                return { valid: false, message: "Tabela musi mieć co najmniej 2 kolumny!" };
            }
            if (rows.length < 1) {
                return { valid: false, message: "Tabela musi mieć co najmniej 1 wiersz danych!" };
            }

            for (let i = 0; i < rows.length; i++) {
                if (rows[i].length !== headers.length) {
                    return { valid: false, message: `Wiersz ${i + 1} ma ${rows[i].length} komórek, oczekiwano ${headers.length}!` };
                }
            }
        }

        if (type === "list") {
            const items = component.querySelector(".list-input").value.split("\n").map(i => i.trim()).filter(Boolean);
            if (items.length < 2) {
                return { valid: false, message: "Lista musi mieć co najmniej 2 elementy!" };
            }
        }

        return { valid: true };
    }

    // GENERUJ PDF
    generateBtn.addEventListener("click", async () => {
        const title = document.getElementById("doc-title")?.value.trim();
        const author = document.getElementById("doc-author")?.value.trim();
        const components = [...document.querySelectorAll(".component")];

        if (!title || !author) {
            return showModal(`<h2>Błąd</h2><p>Proszę podać tytuł i autora dokumentu.</p>`);
        }

        if (components.length === 0) {
            return showModal(`<h2>Błąd</h2><p>Dodaj co najmniej jeden element do dokumentu.</p>`);
        }

        // Waliduj wszystkie komponenty
        for (let component of components) {
            const validation = validateComponent(component);
            if (!validation.valid) {
                return showModal(`<h2>Błąd walidacji</h2><p>${validation.message}</p>`);
            }
        }

        // Zbierz dane
        const sections = components.map(block => {
            const type = block.dataset.type;
            const section = { heading: "", text: "" };

            if (type === "heading") {
                section.heading = block.querySelector(".heading-input").value.trim();
                section.text = "";
            }

            if (type === "paragraph") {
                section.heading = "Paragraf";
                section.text = block.querySelector(".paragraph-input").value.trim();
            }

            if (type === "list") {
                section.heading = block.querySelector(".list-title").value.trim();
                section.text = "Lista elementów:";
                section.list = {
                    title: block.querySelector(".list-title").value.trim(),
                    items: block.querySelector(".list-input").value.split("\n").map(i => i.trim()).filter(Boolean)
                };
            }

            if (type === "table") {
                section.heading = block.querySelector(".table-caption").value.trim();
                section.text = "Tabela z danymi:";
                section.table = {
                    caption: block.querySelector(".table-caption").value.trim(),
                    headers: block.querySelector(".table-headers").value.split(",").map(h => h.trim()),
                    rows: block.querySelector(".table-rows").value.split("\n")
                        .map(r => r.split(",").map(c => c.trim()))
                        .filter(r => r.some(c => c))
                };
            }

            if (type === "image") {
                section.heading = "Obrazek";
                section.text = block.querySelector(".image-alt").value.trim();
                section.image = {
                    src: block.querySelector(".image-src").value.trim(),
                    alt: block.querySelector(".image-alt").value.trim(),
                    caption: block.querySelector(".image-caption").value.trim()
                };
            }

            return section;
        });

        const payload = {
            template: "accessible-template",
            data: {
                title,
                author,
                description: `Dokument '${title}' autorstwa ${author}`,
                sections
            },
            options: {
                checkHTMLAccessibility: true,
                checkLanguage: true,
                checkPDFAccessibility: true
            }
        };

        // Curl do konsoli
        const curlPayload = JSON.stringify(payload).replace(/"/g, '\\"');
        console.log(`Gotowy curl:\n\ncurl -X POST http://localhost:3000/generate \\
  -H "Content-Type: application/json" \\
  -d "${curlPayload}"\n`);

        try {
            const res = await fetch("/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (!res.ok) {
                showModal(`<h2>Błąd generowania</h2><p>${json.message}</p>`);
                console.error("Błąd:", json);
                return;
            }

            // Pobierz PDF
            const link = document.createElement("a");
            link.href = "data:application/pdf;base64," + json.pdfBase64;
            link.download = `${title}_${Date.now()}.pdf`;
            link.click();

            showModal(`<h2>Sukces! ✅</h2>
              <p>PDF został wygenerowany.</p>
              <h3>Raporty dostępności:</h3>
              <pre style="max-height:300px; overflow:auto; background:#f5f5f5; padding:10px; border-radius:4px;">
${JSON.stringify({
    html: json.htmlReport,
    pdf: json.pdfAccesibilityCheck,
    language: json.languageCheck
}, null, 2)}
              </pre>`);

        } catch (err) {
            showModal(`<h2>Błąd</h2><p>${err.message}</p>`);
            console.error(err);
        }
    });
});
