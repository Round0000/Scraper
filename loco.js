const puppeteer = require("puppeteer");

async function scrape(pageToScrap) {
  const browser = await puppeteer.launch();

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

        // const gate = await page.evaluate(() => {
        //   let gateFound = document.querySelector(
        //     ".flight-info__infobox div + div + div div:last-child"
        //   ).innerText;

        //   return gateFound;
        // });
        // obj.gate = gate;

        flights.push(obj);
      }
    });

    return flights;
  });

  for (let i = 0; i < response.length; i++) {
    await page.goto(response[i].link, { waitUntil: "networkidle2" });

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

  //

  await browser.close();

  console.log(response);
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
}

scrape(
  "https://www.airport-charles-de-gaulle.com/cdg-departures-terminal-2F?tp=6"
);

// console.log(data.link);

// getGate(data.link);
