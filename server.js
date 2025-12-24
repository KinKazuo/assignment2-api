const express = require("express");
const dotenv = require("dotenv");

const { getRandomUser } = require("./services/randomUser");
const { getCountryInfo } = require("./services/countries");
const { getExchangeRates } = require("./services/exchange");
const { getNewsByCountryName } = require("./services/news");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/exchange-test", async (req, res) => {
  try {
    const base = req.query.base || "USD";
    const key = process.env.EXCHANGE_RATE_API_KEY || "";
    console.log("EXCHANGE key length:", key.length);

    const data = await getExchangeRates(base);
    res.json({ ok: true, base, data });
  } catch (e) {
    res.status(500).json({ ok: false, details: e.message });
  }
});

app.get("/api/profile", async (req, res) => {
  try {
    const user = await getRandomUser();
    const country = await getCountryInfo(user.country);
    const exchange = await getExchangeRates(country.currencyCode);

    const newsResult = await getNewsByCountryName(user.country, country.capital);

    res.json({
      user,
      country,
      exchange,
      news: newsResult.items,
      newsMeta: {
        found: newsResult.found,
        required: newsResult.required,
        country: newsResult.country
      }
    });
  } catch (e) {
    res.status(500).json({
      error: "Failed to load data",
      details: e.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
