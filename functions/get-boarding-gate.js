const chromium = require("chrome-aws-lambda");

exports.handler = async (event, context) => {
  const pageToScrap = JSON.parse(event.body).pageToScrap;

  if (!pageToScrap)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Page URL not defined" }),
    };

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  await page.goto(pageToScrap, { waitUntil: "networkidle2" });

  const info = await page.evaluate(() => {
    let result = Array.from(document.querySelectorAll("div[class^='table__TableRow']"));
    return result;
  });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      info,
    }),
  };
};
