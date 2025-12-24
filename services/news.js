async function getNewsByCountryName(countryName, capital) {
  const key = (process.env.NEWSDATA_API_KEY || "").trim();
  if (!key) throw new Error("Missing NEWSDATA_API_KEY");

  const country = String(countryName || "").trim();
  const cap = String(capital || "").trim();

  if (!country) return { items: [], found: 0, required: 5, country };

  const aliases = buildAliases(country);

  const items1 = await fetchNewsData(makeUrl(key, country));
  let strict = strictFilterByAliasesInTitle(items1, aliases);

  if (strict.length < 5) {
    const items2 = await fetchNewsData(makeUrl(key, `${country} news`));
    strict = dedupeByUrlOrTitle([...strict, ...strictFilterByAliasesInTitle(items2, aliases)]);
  }

  if (strict.length < 5 && cap) {
    const items3 = await fetchNewsData(makeUrl(key, cap));
    strict = dedupeByUrlOrTitle([...strict, ...strictFilterByAliasesInTitle(items3, aliases)]);
  }

  if (strict.length < 5) {
    const orQuery = aliases.join(" OR ");
    const items4 = await fetchNewsData(makeUrl(key, orQuery));
    strict = dedupeByUrlOrTitle([...strict, ...strictFilterByAliasesInTitle(items4, aliases)]);
  }

  const finalItems = strict.slice(0, 5);

  return {
    items: normalize(finalItems),
    found: finalItems.length,
    required: 5,
    country
  };
}

function makeUrl(key, q) {
  return (
    `https://newsdata.io/api/1/news` +
    `?apikey=${encodeURIComponent(key)}` +
    `&q=${encodeURIComponent(String(q || "").trim())}` +
    `&language=en`
  );
}

async function fetchNewsData(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NewsData HTTP ${res.status} ${res.statusText} | ${text}`);
  }
  const data = await res.json().catch(() => null);
  if (!data) throw new Error("NewsData invalid JSON response");
  return Array.isArray(data.results) ? data.results : [];
}

function strictFilterByAliasesInTitle(items, aliases) {
  const needles = aliases.map((a) => a.toLowerCase());
  return (items || []).filter((a) => {
    const title = (a?.title || "").toLowerCase();
    return needles.some((n) => n && title.includes(n));
  });
}

function dedupeByUrlOrTitle(items) {
  const seen = new Set();
  const out = [];
  for (const a of items) {
    const url = (a?.link || "").trim();
    const title = (a?.title || "").trim();
    const key = url ? `u:${url}` : `t:${title.toLowerCase()}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

function normalize(items) {
  return (items || []).map((a) => ({
    title: a.title ?? "N/A",
    image: a.image_url ?? "",
    description: a.description ?? "",
    url: a.link ?? ""
  }));
}

function buildAliases(country) {
  const base = country.trim();
  const aliases = [base];

  const map = {
    "Norway": ["Norwegian", "Kingdom of Norway"],
    "Australia": ["Australian"],
    "Canada": ["Canadian"],
    "Germany": ["German"],
    "France": ["French"],
    "Italy": ["Italian"],
    "Spain": ["Spanish"],
    "Netherlands": ["Dutch"],
    "Sweden": ["Swedish"],
    "Denmark": ["Danish"],
    "Finland": ["Finnish"],
    "Poland": ["Polish"],
    "Ukraine": ["Ukrainian"],
    "Russia": ["Russian", "RF"],
    "Kazakhstan": ["Kazakh", "KZ"],
    "United States": ["US", "U.S.", "USA", "American"],
    "United Kingdom": ["UK", "U.K.", "Britain", "British"]
  };

  if (map[base]) aliases.push(...map[base]);

  return Array.from(new Set(aliases.map((x) => String(x || "").trim()).filter(Boolean)));
}

module.exports = { getNewsByCountryName };
