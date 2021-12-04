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

  const response = await page.evaluate(() => {
    let flights = [];

    const results = document.querySelectorAll(".flight-col__airline");

    results.forEach((item) => {
      if (
        item.innerText.includes("Air France") && flights.length < 3 ||
        item.innerText.includes("KLM") && flights.length < 3
      ) {
        let obj = {};

        let result = item.parentElement.parentElement;

        obj.flightNumber = result.querySelector(
          ".flight-col__flight a"
        ).innerText;
        obj.scheduledTime = result.querySelector(".flight-col__hour").innerText;
        obj.destination = result.querySelector(
          ".flight-col__dest-term"
        ).innerText;
        obj.link = result.querySelector(".flight-col__flight--link").href;

        await page.goto(obj.link, { waitUntil: "networkidle2" });

        const gate = await page.evaluate(() => {
          let gateFound = document.querySelector(
            ".flight-info__infobox div + div + div div:last-child"
          ).innerText;

          return gateFound;
        });

        obj.gate = gate;

        flights.push(obj);
      }
    });

    return flights;
  });

  //

  await browser.close();

  console.log(response);
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
