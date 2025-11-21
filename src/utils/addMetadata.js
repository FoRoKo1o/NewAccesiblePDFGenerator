import { PDFDocument, PDFName } from "pdf-lib";
import fs from "fs/promises";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
}

function buildXMP(data) {
  const title = escapeXml(data.title || "Dokument PDF");
  const author = escapeXml(data.author || "Autor nieznany");
  const desc = escapeXml(data.description || data.subject || "Accessible PDF");
  const creator = escapeXml(data.creator || "accessible-doc-generator");
  const producer = escapeXml(data.producer || "pdf-lib (https://github.com/Hopding/pdf-lib)");
  const keywords = Array.isArray(data.keywords) ? data.keywords.join(", ") : (data.keywords || "accessible, PDF, WCAG");

  return `<?xpacket begin='\uFEFF' id='W5M0MpCehiHzreSzNTczkc9d'?>
<x:xmpmeta xmlns:x='adobe:ns:meta/'>
 <rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
  <rdf:Description rdf:about=''
    xmlns:dc='http://purl.org/dc/elements/1.1/'
    xmlns:xmp='http://ns.adobe.com/xap/1.0/'
    xmlns:pdf='http://ns.adobe.com/pdf/1.3/'
    xmlns:pdfuaid='http://www.aiim.org/pdfua/ns/id/'>
    <dc:title><rdf:Alt><rdf:li xml:lang='x-default'>${title}</rdf:li></rdf:Alt></dc:title>
    <dc:creator><rdf:Seq><rdf:li>${author}</rdf:li></rdf:Seq></dc:creator>
    <dc:description><rdf:Alt><rdf:li xml:lang='x-default'>${desc}</rdf:li></rdf:Alt></dc:description>
    <pdf:Keywords>${keywords}</pdf:Keywords>
    <xmp:CreatorTool>${creator}</xmp:CreatorTool>
    <pdf:Producer>${producer}</pdf:Producer>
    <pdfuaid:part>1</pdfuaid:part>
    <pdfuaid:conformance>A</pdfuaid:conformance>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end='w'?>`;
}

export async function addMetadata(pdfPath, data) {
  // console.log(`adding metadata`);
  const pdfDoc = await PDFDocument.load(await fs.readFile(pdfPath));

  // Basic metadata
  pdfDoc.setTitle(data.title || "Dokument PDF");
  pdfDoc.setAuthor(data.author || "Autor nieznany");
  pdfDoc.setSubject(data.description || data.contentType || "Accessible PDF");
  pdfDoc.setKeywords([...(data.keywords || []), ...(data.tags || [])]);
  pdfDoc.setProducer("accessible-doc-generator (PDF/UA compliant)");
  pdfDoc.setCreator("accessible-doc-generator");

  // XMP metadata including PDF/UA
  const xmp = buildXMP(data);
  const xmpBytes = Buffer.from(xmp, "utf8");
  const metadataStream = pdfDoc.context.register(
    pdfDoc.context.stream(xmpBytes, {
      Type: PDFName.of("Metadata"),
      Subtype: PDFName.of("XML")
    })
  );
  pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStream);

  // MarkInfo (required for PDF/UA)
  const markInfo = pdfDoc.context.obj({
    Type: PDFName.of("MarkInfo"),
    Marked: true
  });
  pdfDoc.catalog.set(PDFName.of("MarkInfo"), markInfo);

  // UAIdentification dictionary (required)
  const uaDict = pdfDoc.context.obj({
    Part: 1,
    Conformance: PDFName.of("A")
  });
  pdfDoc.catalog.set(PDFName.of("UAIdentification"), uaDict);

  // Save PDF with object streams disabled (better PDF/UA support)
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: false,
    addDefaultXrefEntries: true,
    updateMetadata: true
  });

  await fs.writeFile(pdfPath, pdfBytes);
  return pdfPath;
}