const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { pathToFileURL } = require('url');

// Dynamic Chrome Executable Path Resolution
function getChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'chrome'; // fallback to PATH
}

const chromePath = getChromePath();
const htmlPath = path.join(__dirname, 'index.html');
const lightTempPath = path.join(__dirname, 'light_temp.html');
const darkTempPath = path.join(__dirname, 'dark_temp.html');
const pdfDir = path.join(__dirname, 'assets', 'pdf');
const pdfLightPath = path.join(pdfDir, 'calendario_2026_light.pdf');
const pdfDarkPath = path.join(pdfDir, 'calendario_2026_dark.pdf');

// Ensure output folders exist
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const originalHtml = fs.readFileSync(htmlPath, 'utf8');

// Helper to remove a block of HTML using regex
function removeContainer(html, containerClass) {
  const regex = new RegExp(`<div class="a4-container ${containerClass}">[\\s\\S]*?<\\/footer>\\s*<\\/div>`, 'g');
  return html.replace(regex, '<!-- Container removed -->');
}

// Generate Light HTML (remove dark version)
const lightHtml = removeContainer(originalHtml, 'dark-version');
fs.writeFileSync(lightTempPath, lightHtml, 'utf8');

// Generate Dark HTML (remove light version)
const darkHtml = removeContainer(originalHtml, 'light-version');
fs.writeFileSync(darkTempPath, darkHtml, 'utf8');

console.log('Temporary HTML files created.');

try {
  // Convert Light to PDF
  console.log('Generating Light PDF...');
  const lightUrl = pathToFileURL(lightTempPath).href;
  execSync(`"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfLightPath}" "${lightUrl}"`);
  const publicPdfLightPath = path.join(publicDir, 'calendario_2026_light.pdf');
  fs.copyFileSync(pdfLightPath, publicPdfLightPath);
  console.log('Light PDF generated and copied to public/ successfully.');

  // Convert Dark to PDF
  console.log('Generating Dark PDF...');
  const darkUrl = pathToFileURL(darkTempPath).href;
  execSync(`"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfDarkPath}" "${darkUrl}"`);
  const publicPdfDarkPath = path.join(publicDir, 'calendario_2026_dark.pdf');
  fs.copyFileSync(pdfDarkPath, publicPdfDarkPath);
  console.log('Dark PDF generated and copied to public/ successfully.');
} catch (err) {
  console.error('Error generating PDFs:', err.message);
} finally {
  // Clean up temporary files
  if (fs.existsSync(lightTempPath)) fs.unlinkSync(lightTempPath);
  if (fs.existsSync(darkTempPath)) fs.unlinkSync(darkTempPath);
  console.log('Temporary files cleaned up.');
}
