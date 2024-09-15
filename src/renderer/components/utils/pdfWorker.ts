import { PDFDocument } from 'pdf-lib';

self.onmessage = async (event) => {
  const { pdfBlob, password } = event.data;

  try {
    // Load the PDF document using pdf-lib
    const pdfBytes = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Encrypt the PDF with the provided password
    const encryptedPdfBytes = await pdfDoc.save({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'lowResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    // Create a new Blob with the encrypted PDF data
    const encryptedPdfBlob = new Blob([encryptedPdfBytes], {
      type: 'application/pdf',
    });

    // Send the encrypted PDF blob back to the main thread
    self.postMessage({ encryptedPdfBlob });
  } catch (error) {
    console.error('Error in Web Worker:', error);
    self.postMessage({ error: error.message });
  }
};
