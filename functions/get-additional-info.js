const chromium = require("chrome-aws-lambda");

exports.handler = async (event, context) => {
  const pagesToScrap = JSON.parse(event.body).pagesToScrap;

  if (!pagesToScrap)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Page URLs not defined" }),
    };

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  let details = [];

  for (let i = 0; i < pagesToScrap.length; i++) {
    await page.goto(pagesToScrap[i], { waitUntil: "networkidle2" });

    const additionalInfo = await page.evaluate(() => {
      const info = {};
      info.gate = document.querySelector(
        ".flight-info__infobox div + div + div div:last-child"
      ).innerText;

      info.realDepartureTime = document.querySelector('.flight-info__infobox-text--G').innerText;

      return info;
    });

    details.push(additionalInfo);
  }

  await browser.close();

  console.log(details);
  return {
    statusCode: 200,
    body: JSON.stringify(details),
  };
};


