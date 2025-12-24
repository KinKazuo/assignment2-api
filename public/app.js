const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");
const content = document.getElementById("content");

btn.addEventListener("click", async () => {
  statusEl.textContent = "Loading...";
  content.innerHTML = "";

  try {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();

    renderUser(data.user);
    renderCountry(data.country, data.exchange);
    renderNews(data.news, data.newsMeta);


    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = "Failed to load data. Try again.";
  }
});

function card(title, innerHtml) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `<h2>${title}</h2>${innerHtml}`;
  content.appendChild(div);
}

function renderUser(u) {
  card("User", `
    <div class="row">
      <img class="avatar" src="${u.picture}" alt="profile"/>
      <div>
        <div><b>First name:</b> ${u.firstName}</div>
        <div><b>Last name:</b> ${u.lastName}</div>
        <div><b>Gender:</b> ${u.gender}</div>
        <div><b>Age:</b> ${u.age}</div>
        <div><b>Date of birth:</b> ${u.dob ? new Date(u.dob).toLocaleDateString() : "N/A"}</div>
        <div><b>City:</b> ${u.city}</div>
        <div><b>Country:</b> ${u.country}</div>
        <div><b>Full address:</b> ${u.fullAddress}</div>
      </div>
    </div>
  `);
}

function renderCountry(c, ex) {
  const usd = ex?.USD ? ex.USD.toFixed(2) : "N/A";
  const kzt = ex?.KZT ? ex.KZT.toFixed(2) : "N/A";

  card("Country + Exchange Rate", `
    <div class="row">
      ${c.flag ? `<img class="flag" src="${c.flag}" alt="flag"/>` : ""}
      <div>
        <div><b>Country:</b> ${c.countryName}</div>
        <div><b>Capital:</b> ${c.capital}</div>
        <div><b>Languages:</b> ${c.languages}</div>
        <div><b>Currency:</b> ${c.currencyCode} (${c.currencyName})</div>
        <hr/>
        <div><b>Exchange:</b> 1 ${c.currencyCode} = ${usd} USD, 1 ${c.currencyCode} = ${kzt} KZT</div>
      </div>
    </div>
  `);
}

function renderNews(news, meta) {
  const found = meta?.found ?? (news?.length ?? 0);
  const required = meta?.required ?? 5;
  const country = meta?.country ?? "";

  const note = `
    <div style="margin-bottom:10px;">
      <b>Strict condition:</b> headline contains "${country}" (or its alias). Found ${found} of ${required}.
    </div>
  `;

  const items = (news || []).map(n => `
    <div class="newsItem">
      ${
        n.image
          ? `<img class="newsImg" src="${n.image}" alt="news"/>`
          : `<div class="newsImg" style="display:flex;align-items:center;justify-content:center;">No image</div>`
      }
      <div>
        <div class="newsTitle">${n.title}</div>
        <div class="newsDesc">${n.description ?? ""}</div>
        ${n.url ? `<a href="${n.url}" target="_blank" rel="noreferrer">Open source</a>` : ""}
      </div>
    </div>
  `).join("");

  card("News (Top 5)", note + (items || "<div>No strict-matching news found</div>"));
}

