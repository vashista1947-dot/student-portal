export async function readJdPdf(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose a PDF of up to 5 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the selected PDF.'));
    reader.readAsDataURL(file);
  });
}
