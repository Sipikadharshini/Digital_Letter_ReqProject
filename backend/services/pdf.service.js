const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

exports.addSignatureToPdf = async (inputPdfPath, signatureObj, outputPath) => {
  try {
    console.log('📝 Adding signature to PDF:', { signatureObj, outputPath });

    const existingPdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // We assume the signature applies to the first page for simplicity, or we can get it from coordinates if page is specified
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Load signature image (Assume it's PNG or JPG)
    // We need to fetch the signature from user profile. For now, we will draw text if image is not there
    let signatureImageBytes = null;
    let image = null;

    const signatureImagePath = path.join(__dirname, '..', signatureObj.signatureUrl);

    if (signatureObj.signatureUrl) {
      if (fs.existsSync(signatureImagePath)) {
        console.log('✓ Signature file found:', signatureImagePath);
        signatureImageBytes = fs.readFileSync(signatureImagePath);
        if (signatureObj.signatureUrl.endsWith('.png')) {
          image = await pdfDoc.embedPng(signatureImageBytes);
        } else {
          image = await pdfDoc.embedJpg(signatureImageBytes);
        }
      } else {
        console.warn('⚠ Signature file NOT found:', signatureImagePath);
      }
    } else {
      console.warn('⚠ No signatureUrl provided');
    }

    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // The signatureObj coordinates are percentages (0.0 -> 1.0) relative to top-left.
    let sigWidth = 150;
    let sigHeight = 50;

    if (image) {
      // Maintain aspect ratio and auto-scale properly
      const imgDims = image.scale(1);
      const targetMaxWidth = 150;
      const targetMaxHeight = 50;

      const scaleX = targetMaxWidth / imgDims.width;
      const scaleY = targetMaxHeight / imgDims.height;
      const scale = Math.min(scaleX, scaleY);

      sigWidth = imgDims.width * scale;
      sigHeight = imgDims.height * scale;
    }

    const pdfX = signatureObj.x * pageWidth;
    // pdf-lib uses bottom-left origin for drawImage y parameter (bottom edge of image).
    // Convert from browser top-down coords (0=top, 1=bottom) to PDF bottom-up coords (0=bottom).
    // We want the TOP of the signature at the user's click position.
    // Top position in PDF coords = pageHeight - (signatureObj.y * pageHeight)
    // Bottom position (for drawImage y) = top - sigHeight
    const pdfY = pageHeight - (signatureObj.y * pageHeight) - sigHeight;

    console.log('📐 Calculated positions:', { pdfX, pdfY, sigWidth, sigHeight, pageWidth, pageHeight });

    if (image) {
      // Draw the image
      console.log('🖼 Drawing signature image');
      firstPage.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: sigWidth,
        height: sigHeight,
        opacity: 0.85 // Add slight opacity for natural ink effect
      });
    } else {
      // Fallback: draw text as signature
      console.log('📄 Drawing fallback text signature');
      firstPage.drawText(`Signed by: ${signatureObj.name}\nRole: ${signatureObj.role}`, {
        x: pdfX,
        y: pdfY + 15, // text draws from baseline up usually
        size: 15,
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    console.log('✅ Signature added successfully, saved to:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('❌ PDF Signature Error:', error);
    throw error;
  }
};
