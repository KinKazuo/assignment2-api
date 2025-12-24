async function getCountryInfo(countryName) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
  const res = await fetch(url);

  if (!res.ok) {
    const res2 = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
    if (!res2.ok) throw new Error("REST Countries API failed");
    return parseCountry(await res2.json());
  }
  return parseCountry(await res.json());
}

function parseCountry(arr) {
  const c = arr?.[0];
  if (!c) throw new Error("REST Countries returned empty result");

  const languages = c.languages ? Object.values(c.languages) : [];
  const currencyCodes = c.currencies ? Object.keys(c.currencies) : [];
  const currencyCode = currencyCodes[0] ?? "N/A";

  return {
    countryName: c.name?.common ?? "N/A",
    capital: Array.isArray(c.capital) ? (c.capital[0] ?? "N/A") : "N/A",
    languages: languages.length ? languages.join(", ") : "N/A",
    currencyCode,
    currencyName: currencyCode !== "N/A" ? (c.currencies?.[currencyCode]?.name ?? "N/A") : "N/A",
    flag: c.flags?.png ?? c.flags?.svg ?? ""
  };
}

module.exports = { getCountryInfo };
