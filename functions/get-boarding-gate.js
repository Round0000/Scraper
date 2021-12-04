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
        (item.innerText.includes("Air France") ||
          item.innerText.includes("KLM")) &&
        flights.length < 5
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

        flights.push(obj);
      }
    });

    return flights;
  });

  for (let i = 0; i < response.length; i++) {
    await page.goto(response[i].link, { waitUntil: "networkidle2", timeout: 15000 });

    const additionalInfo = await page.evaluate(() => {
      const info = {};
      info.gate = document.querySelector(
        ".flight-info__infobox div + div + div div:last-child"
      ).innerText;

      info.realDepartureTime = document.querySelector('.flight-info__infobox-text--G').innerText;

      return info;
    });

    response[i].gate = additionalInfo.gate;
    response[i].realDepartureTime = additionalInfo.realDepartureTime;
  }

  await browser.close();

  console.log(response);
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
