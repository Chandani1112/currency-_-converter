

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

// Function to update flag image based on currency code using countryList mapping
const updateFlag = (element) => {
  const currCode = element.value;
  const countryCode = countryList[currCode] || "UN"; // UN = Unknown flag
  const img = element.parentElement.querySelector("img");
  img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
};

// Fetch currency list dynamically and populate dropdowns
async function populateDropdowns() {
  try {
    msg.innerText = "Loading currencies...";

    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) throw new Error("Failed to fetch currency list.");

    const data = await response.json();
    const currencies = Object.keys(data.rates);

    dropdowns.forEach((select) => {
      select.innerHTML = ""; // Clear old options
      currencies.forEach((curr) => {
        const option = document.createElement("option");
        option.value = curr;
        option.innerText = curr;
        // Set default selections
        if (select.name === "from" && curr === "USD") option.selected = true;
        if (select.name === "to" && curr === "INR") option.selected = true;
        select.appendChild(option);
      });

      updateFlag(select);

      // Update flag when user changes selection
      select.addEventListener("change", (e) => updateFlag(e.target));
    });

    msg.innerText = "";
  } catch (error) {
    console.error(error);
    msg.innerText = "Failed to load currencies. Please refresh the page.";
  }
}

// Populate dropdowns on page load
populateDropdowns();

// Convert currency on button click
btn.addEventListener("click", async (evt) => {
  evt.preventDefault();

  const amountInput = document.querySelector(".amount input");
  let amount = amountInput.value.trim();
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    msg.innerText = "Please enter a valid amount.";
    return;
  }
  amount = Number(amount);

  msg.innerText = "Fetching conversion rate...";

  try {
    const url = `https://open.er-api.com/v6/latest/${fromCurr.value}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch exchange rates.");

    const data = await res.json();
    if (data.result !== "success") throw new Error("API error.");

    const rate = data.rates[toCurr.value];
    if (!rate) {
      msg.innerText = `No exchange rate found for ${toCurr.value}`;
      return;
    }

    const converted = (amount * rate).toFixed(4);
    msg.innerText = `${amount} ${fromCurr.value} = ${converted} ${toCurr.value}`;
  } catch (err) {
    console.error(err);
    msg.innerText = "Error fetching exchange rate. Try again later.";
  }
});
