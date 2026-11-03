const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(__dirname, '../docs/images');

async function run() {
  console.log('Launching Edge from:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login Page
  console.log('1. Navigating to login...');
  await page.goto('https://slt-legaledge.vercel.app/login', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, '00_login_page.png') });
  console.log('Saved: 00_login_page.png');

  // Click Ravindu (Officer) Demo Button to get full officer intake permissions
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Ravindu (Officer)')) {
      await btn.click();
      console.log('Clicked Ravindu (Officer) demo button');
      break;
    }
  }

  // Click Sign In
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    console.log('Clicked Sign In button');
  }

  // Wait for Dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '01_executive_dashboard.png') });
  console.log('Saved: 01_executive_dashboard.png');

  // 2. Initial Documents Page
  console.log('2. Navigating to Initial Documents...');
  await page.goto('https://slt-legaledge.vercel.app/initial-docs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '02_initial_documents_filter_ui.png') });
  console.log('Saved clean: 02_initial_documents_filter_ui.png');

  // 2b. Initial Documents Intake Modal
  console.log('2b. Opening Initial Documents Intake Modal...');
  try {
    const newDocBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('New Document') || b.textContent.includes('initialDocs.addNew') || b.textContent.includes('Add New'));
    });
    if (newDocBtn && newDocBtn.asElement()) {
      await newDocBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(outDir, '02b_initial_documents_intake_modal.png') });
      console.log('Saved clean: 02b_initial_documents_intake_modal.png');

      // Close modal
      const closeBtn = await page.$('.slt-dialog-bar button, .q-dialog button[aria-label="Close"]');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 800));
      }
    }
  } catch (e) {
    console.warn('Could not capture initial docs modal:', e.message);
  }

  // 3. Legal Cases Page
  console.log('3. Navigating to Legal Cases...');
  await page.goto('https://slt-legaledge.vercel.app/cases', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '01_legal_cases_ui_overview.png') });
  console.log('Saved clean: 01_legal_cases_ui_overview.png');

  // 4. Agreements Page
  console.log('4. Navigating to Agreements...');
  await page.goto('https://slt-legaledge.vercel.app/agreements', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '03_agreements_contracts.png') });
  console.log('Saved clean: 03_agreements_contracts.png');

  // 4b. Agreements Creation Modal
  console.log('4b. Opening Agreements Creation Modal...');
  try {
    const createAgrBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Create Agreement'));
    });
    if (createAgrBtn && createAgrBtn.asElement()) {
      await createAgrBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(outDir, '03b_agreements_creation_modal.png') });
      console.log('Saved clean: 03b_agreements_creation_modal.png');

      // Close modal
      const closeAgrBtn = await page.$('.slt-dialog-bar button, .q-dialog button[aria-label="Close"]');
      if (closeAgrBtn) {
        await closeAgrBtn.click();
        await new Promise(r => setTimeout(r, 800));
      }
    }
  } catch (e) {
    console.warn('Could not capture agreements modal:', e.message);
  }

  // 5. Approvals Page
  console.log('5. Navigating to Approvals...');
  await page.goto('https://slt-legaledge.vercel.app/approvals', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, '04_approvals_inbox.png') });
  console.log('Saved clean: 04_approvals_inbox.png');

  await browser.close();
  console.log('ALL CLEAN SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
