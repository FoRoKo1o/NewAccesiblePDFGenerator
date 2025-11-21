# Intro
This service generates accessible PDF/UA-compliant documents based on structured JSON input.
It supports images, tables, lists, and accessibility validation through external tools.

## Important
Python and `pikepdf` is required to generate compliant document. 

## Example
`POST /generate`
```
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "accessible-template",
    "data": {
      "title": "Mój raport",
      "author": "Jan Kowalski",
      "description": "Test",
      "sections": [
        {
          "heading": "Sekcja 1",
          "text": "Zawartość"
        }
      ]
    },
    "options": {
      "checkHTMLAccessibility": true,
      "checkLanguage": true,
      "checkPDFAccessibility": true
    }
  }'
  ```

# Sections
Each section can contain:
- a heading
- text
- optional image
- optional table
- optional list

## Heading
```
{
  "heading": "Podsumowanie",
  "text": "Testowy paragraf zawierający dużą liczbę znaków specjalnych: ąćęłńóśźż..."
}

```
## Img
```
{
    "heading": "Wprowadzenie",
    "text": "Text",
    "image": {
        "src": "https:example.cpm/img.png",
        "alt": "To jest przykładowy obrazek",
        "caption": "Rysunek 1. Przykładowy obrazek"
    }
}
```
## Table
```
{
  "heading": "Table heading",
  "text": "Table text",
  "table": {
    "caption": "Table caption",
    "headers": ["ID", "Placeholder", "Placeholder", "Placeholder", "Placeholder"],
    "rows": [
      ["X", "Placeholder", "Placeholder", "Placeholder", "Placeholder"],
      ["X", "Placeholder", "Placeholder", "Placeholder", "Placeholder"],
      ["X", "Placeholder", "Placeholder", "Placeholder", "Placeholder"],
    ]
  }
}
```
## List
```
{
  "heading": "qwe",
  "text": "ewq",
  "list": {
    "title": "Najważniejsze wnioski",
    "items": [
      "item 1",
      "item 2",
      "item 3",
    ]
  }
}
```

## API response
```{
  "success": true,
  "pdfBase64": "<BASE64_PDF>",
  "reports": {
    "html": { ... },
    "pdf": { ... },
    "language": { ... }
  }
}
```
Fields:
- `pdfBase64` – generated PDF in Base64 format
- `reports.html` – HTML accessibility scan results
- `reports.pdf` – PDF/UA compliance results (veraPDF)
- `reports.language` – language detection results

# External doc
- [Logios API doc](https://logios.dev/wp-content/uploads/2024/02/logios-api.pdf) - checkLanguage.js
- [VeraPDF doc](https://docs.verapdf.org/) - checkPdfCompliance.js
- [Pa11y](https://pa11y.org/) - checkHTMLAccessibility.js
- [pikepdf](https://pypi.org/project/pikepdf/) - fixing Puppeter limitations
- Puppeter - PDF generaton process