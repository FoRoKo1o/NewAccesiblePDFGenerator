endpoint: `/generate`
POST /generate
Przykład wywołania
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
# heading
```
{
  "heading": "Podsumowanie",
  "text": "Testowy paragraf zawierający dużą liczbę znaków specjalnych: ąćęłńóśźż..."
}

```
# Img
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
# Table
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
# list
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

# API response
```{
  "success": true,
  "pdfBase64": "<BASE64_PDF>",
  "reports": {
    "html": { ... },
    "pdf": { ... },
    "language": { ... }
  }
}```
