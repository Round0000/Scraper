let data;

document
  .querySelector('button[type="submit"]')
  .addEventListener("click", (e) => {
    e.preventDefault();

    const pageToScrap = document.getElementById("page").value;

    if (!pageToScrap)
      return (document.getElementById("result").textContent =
        "Please enter a page URL");

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ pageToScrap: pageToScrap }),
    };

    document.getElementById("result").textContent = "Please wait...";

    fetch("/.netlify/functions/get-boarding-gate", options)
      .then((res) => res.json())
      .then((res) => {
        data = res;
        console.log("res inside script.js ======> ", res);
        const list = document.createElement("UL");
        list.id = "flightsList";
        Array.from(res).forEach((flight) => {
          const listItem = document.createElement("LI");
          listItem.innerHTML = `
            <p>${flight.scheduledTime}</p>
            <p>${flight.flightNumber}</p>
            <p>${flight.destination}</p>
          `;
          list.appendChild(listItem);
        });
        document.getElementById("result").appendChild(list);
      })
      .catch((err) => {
        console.log(err);
        document.getElementById(
          "result"
        ).textContent = `Error: ${err.toString()}`;
      });
  });
