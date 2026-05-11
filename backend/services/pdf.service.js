const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

exports.addSignatureToPdf = async (inputPdfPath, signatureObj, outputPath) => {
  try {
    const existingPdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // We assume the signature applies to the first page for simplicity, or we can get it from coordinates if page is specified
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Load signature image (Assume it's PNG or JPG)
    // We need to fetch the signature from user profile. For now, we will draw text if image is not there
    let signatureImageBytes = null;
    let image = null;

    if (signatureObj.signatureUrl && fs.existsSync(path.join(__dirname, '..', signatureObj.signatureUrl))) {
      signatureImageBytes = fs.readFileSync(path.join(__dirname, '..', signatureObj.signatureUrl));
      if (signatureObj.signatureUrl.endsWith('.png')) {
        image = await pdfDoc.embedPng(signatureImageBytes);
      } else {
        image = await pdfDoc.embedJpg(signatureImageBytes);
      }
    }

    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // The signatureObj coordinates are percentages (0.0 -> 1.0) relative to top-left.
    const sigWidth = 150;
    const sigHeight = 50;

    const pdfX = signatureObj.x * pageWidth;
    // pdf-lib's origin is bottom-left, so we flip the Y calculation.
    // We calculate where the top edge of the signature should be, 
    // then subtract sigHeight because drawImage's Y sets the bottom edge.
    const pdfY = pageHeight - (signatureObj.y * pageHeight) - sigHeight;

    if (image) {
      // Draw the image
      firstPage.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: sigWidth,
        height: sigHeight,
      });
    } else {
      // Fallback: draw text as signature
      firstPage.drawText(`Signed by: ${signatureObj.name}\nRole: ${signatureObj.role}`, {
        x: pdfX,
        y: pdfY + 15, // text draws from baseline up usually
        size: 15,
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
  } catch (error) {
    console.error('PDF Signature Error:', error);
    throw error;
  }
};
