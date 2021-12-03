const chromium = require("chrome-aws-lambda");

exports.handler = async (event, context) => {
  const pageToScrap = JSON.parse(event.body).pageToScrap;

  if (!pageToScrap)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Page URL not defined" }),
    };



  async function scrape(url) {
    const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const response = await page.evaluate(() => {
      let flights = [];

      const results = document.querySelectorAll(".flight-col__airline");

      results.forEach((item) => {
        if (
          item.innerText.includes("Air France") ||
          item.innerText.includes("KLM")
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

    //

    await browser.close();

    console.log("FIRST RESPONSE FROM SCRAP FUNCTION :", response[0]);
    return response;
  }

  async function getGates(data) {
    data = [data[0], data[1], data[2]];
    let finalData = [];
    const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
    const page = await browser.newPage();


    console.log("data length in getGates function", data.length);

    for (let i = 0; i < data.length; i++) {
      await page.goto(data[i].link, { waitUntil: "networkidle2" });

      const gate = await page.evaluate(() => {
        let gateFound = document.querySelector(
          ".flight-info__infobox div + div + div div:last-child"
        ).innerText;

        return gateFound;
      });

      data[i].gate = gate;
      finalData.push(data[i]);
    }

    await page.close();

    await browser.close();
    console.log("FINAL DATA :", finalData);
    return finalData;
  }

  const data = scrape(
    "https://www.airport-charles-de-gaulle.com/cdg-departures-terminal-2F?tp=6"
  ).then((data) => {
    return getGates(data).then((res) => {
      console.log("oulala", res);
      return res;
    });
  });

  return data
};