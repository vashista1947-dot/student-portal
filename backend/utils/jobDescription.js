const { PDFParse } = require('pdf-parse');

async function extractPdf(encoded) {
  const maxBytes = 5 * 1024 * 1024;
  if (typeof encoded !== 'string' || encoded.length > Math.ceil(maxBytes / 3) * 4) {
    throw new Error('Choose a PDF of up to 5 MB.');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length > maxBytes || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('Choose a valid PDF of up to 5 MB.');
  }
  const parser = new PDFParse({ data: bytes, isEvalSupported: false });
  try {
    const { pages } = await parser.getText({ first: 100 });
    const text = pages.map(page => page.text.trim()).join('\n').trim();
    if (!text) throw new Error();
    return text.slice(0, 200000);
  } catch {
    throw new Error('Could not read the JD PDF. Use a text PDF or the written job description.');
  } finally {
    await parser.destroy();
  }
}

function relevantText(text, query) {
  if (text.length <= 10000) return text;
  const words = [...new Set(query.toLowerCase().match(/[a-z0-9+#]{3,}/g) || [])];
  const sections = text.match(/[\s\S]{1,1200}/g).map((content, index) => ({
    content, index, score: words.filter(word => content.toLowerCase().includes(word)).length
  }));
  return sections.sort((a, b) => b.score - a.score).slice(0, 8)
    .sort((a, b) => a.index - b.index).map(section => section.content).join('\n');
}

module.exports = { extractPdf, relevantText };
