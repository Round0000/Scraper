const puppeteer = require("puppeteer");

async function scrape(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });
  const href = await page.evaluate(() => {
    let link = document.querySelector(
      "div.table__Table-sc-1x7nv9w-6.zGTLC > a:nth-child(3)"
    ).href;
    return link;
  });
  await page.goto(href, { waitUntil: "networkidle2" });
  // const info = await page.evaluate(() => {
  //   let result = document.querySelectorAll("div[class^='table__TableRow']");
  //   let data = [];
  //   result.forEach((item) =>
  //     data.push(item.querySelector('h2').textContent)
  //   );
  //   return data;
  // });

  const response = await page.evaluate(() => {
    const number = document.querySelector(
      "#__next > div > section > div:nth-child(3) > div > div:nth-child(2) > div > div > div > div > div > div > div > div"
    ).innerText;

    const destination = document.querySelectorAll(
      "a[class^='route-with-plane']"
    )[1].innerText;

    const gate = document.querySelectorAll("div[class^='ticket__TGBValue']")[1]
      .innerText;

    const flightInfo = {
      number: number,
      destination: destination,
      gate: gate,
    };

    return flightInfo;
  });

  await browser.close();

  console.log(response);
}

scrape(
  "https://www.flightstats.com/v2/flight-tracker/departures/CDG/AF?year=2021&month=12&date=3"
);

