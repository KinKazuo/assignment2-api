async function getExchangeRates(baseCurrency) {
  const key = process.env.EXCHANGE_RATE_API_KEY;

  if (!baseCurrency || baseCurrency === "N/A") {
    return { base: baseCurrency ?? "N/A", USD: null, KZT: null };
  }

  if (!key) {
    throw new Error("Missing EXCHANGE_RATE_API_KEY in .env");
  }

  const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/${encodeURIComponent(baseCurrency)}`;

  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(`ExchangeRate fetch failed: ${e.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ExchangeRate HTTP ${res.status} ${res.statusText} | ${text}`);
  }

  const data = await res.json().catch(() => null);
  if (!data) throw new Error("ExchangeRate invalid JSON response");

  if (data.result && data.result !== "success") {
    throw new Error(`ExchangeRate result=error | ${data["error-type"] || "unknown"}`);
  }

  const rates = data.conversion_rates || {};
  return {
    base: baseCurrency,
    USD: typeof rates.USD === "number" ? rates.USD : null,
    KZT: typeof rates.KZT === "number" ? rates.KZT : null
  };
}

module.exports = { getExchangeRates };
