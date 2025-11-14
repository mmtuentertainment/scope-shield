// T002: Verify jsPDF installation with test PDF generation
import { jsPDF } from 'jspdf';

async function testJsPDF() {
  try {
    console.log('Testing jsPDF installation...');

    const doc = new jsPDF();
    doc.text('ScopeShield Test PDF', 10, 10);

    // Get PDF as data URI (doesn't trigger download in test)
    const pdfDataUri = doc.output('dataurlstring');

    if (pdfDataUri && pdfDataUri.startsWith('data:application/pdf')) {
      console.log('✅ jsPDF test passed - PDF generation works');
      return true;
    } else {
      console.error('❌ jsPDF test failed - Invalid PDF output');
      return false;
    }
  } catch (error) {
    console.error('❌ jsPDF test failed:', error.message);
    return false;
  }
}

// Run test
testJsPDF().then(success => {
  process.exit(success ? 0 : 1);
});
