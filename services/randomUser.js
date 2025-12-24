async function getRandomUser() {
  const res = await fetch("https://randomuser.me/api/");
  if (!res.ok) throw new Error("RandomUser API failed");
  const data = await res.json();

  const u = data.results?.[0];
  if (!u) throw new Error("RandomUser returned empty result");

  return {
    firstName: u.name?.first ?? "N/A",
    lastName: u.name?.last ?? "N/A",
    gender: u.gender ?? "N/A",
    picture: u.picture?.large ?? "",
    age: u.dob?.age ?? "N/A",
    dob: u.dob?.date ?? "",
    city: u.location?.city ?? "N/A",
    country: u.location?.country ?? "N/A",
    fullAddress: `${u.location?.street?.name ?? "N/A"} ${u.location?.street?.number ?? ""}`.trim()
  };
}
module.exports = { getRandomUser };
