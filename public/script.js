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
        document.getElementById("result").textContent = JSON.stringify(res);
      })
      .catch((err) => {
        console.log(err);
        document.getElementById(
          "result"
        ).textContent = `Error: ${err.toString()}`;
      });
  });
