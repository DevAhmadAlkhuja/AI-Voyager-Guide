const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

const COUNTRY_TO_CONTINENT = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  CL: "South America",
  CO: "South America",
  PE: "South America",
  GB: "Europe",
  IE: "Europe",
  FR: "Europe",
  ES: "Europe",
  PT: "Europe",
  IT: "Europe",
  DE: "Europe",
  NL: "Europe",
  BE: "Europe",
  CH: "Europe",
  AT: "Europe",
  GR: "Europe",
  TR: "Europe",
  NO: "Europe",
  SE: "Europe",
  DK: "Europe",
  FI: "Europe",
  PL: "Europe",
  CZ: "Europe",
  HU: "Europe",
  RO: "Europe",
  HR: "Europe",
  RS: "Europe",
  BG: "Europe",
  UA: "Europe",
  RU: "Europe",
  EG: "Africa",
  MA: "Africa",
  TN: "Africa",
  ZA: "Africa",
  KE: "Africa",
  TZ: "Africa",
  NG: "Africa",
  ET: "Africa",
  IN: "Asia",
  PK: "Asia",
  BD: "Asia",
  LK: "Asia",
  NP: "Asia",
  CN: "Asia",
  JP: "Asia",
  KR: "Asia",
  TH: "Asia",
  VN: "Asia",
  SG: "Asia",
  MY: "Asia",
  ID: "Asia",
  PH: "Asia",
  AE: "Asia",
  SA: "Asia",
  IL: "Asia",
  JO: "Asia",
  AU: "Oceania",
  NZ: "Oceania",
};

const CONTINENT_SUGGESTIONS = {
  "North America": [
    { country: "United States", countryCode: "US" },
    { country: "Canada", countryCode: "CA" },
    { country: "Mexico", countryCode: "MX" },
    { country: "Costa Rica", countryCode: "CR" },
    { country: "Panama", countryCode: "PA" },
  ],
  "South America": [
    { country: "Brazil", countryCode: "BR" },
    { country: "Argentina", countryCode: "AR" },
    { country: "Chile", countryCode: "CL" },
    { country: "Colombia", countryCode: "CO" },
    { country: "Peru", countryCode: "PE" },
  ],
  Europe: [
    { country: "France", countryCode: "FR" },
    { country: "Spain", countryCode: "ES" },
    { country: "Italy", countryCode: "IT" },
    { country: "Germany", countryCode: "DE" },
    { country: "Netherlands", countryCode: "NL" },
    { country: "Greece", countryCode: "GR" },
  ],
  Asia: [
    { country: "Japan", countryCode: "JP" },
    { country: "Thailand", countryCode: "TH" },
    { country: "Singapore", countryCode: "SG" },
    { country: "Malaysia", countryCode: "MY" },
    { country: "Vietnam", countryCode: "VN" },
    { country: "United Arab Emirates", countryCode: "AE" },
  ],
  Africa: [
    { country: "Morocco", countryCode: "MA" },
    { country: "Egypt", countryCode: "EG" },
    { country: "South Africa", countryCode: "ZA" },
    { country: "Kenya", countryCode: "KE" },
    { country: "Tanzania", countryCode: "TZ" },
  ],
  Oceania: [
    { country: "Australia", countryCode: "AU" },
    { country: "New Zealand", countryCode: "NZ" },
    { country: "Fiji", countryCode: "FJ" },
  ],
};

function normalizeCountryCode(v) {
  const s = String(v || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : null;
}

function pickTopKey(counts) {
  let bestKey = null;
  let bestVal = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (typeof v !== "number") continue;
    if (v > bestVal) {
      bestVal = v;
      bestKey = k;
    }
  }
  return bestKey;
}

router.get("/ai/suggestions", auth, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT country, country_code FROM events WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1000",
      { uid: req.user.id },
    );

    const visitedCodes = new Set();
    const countryCounts = {};
    const continentCounts = {};

    for (const r of rows) {
      const code = normalizeCountryCode(r.country_code);
      if (!code) continue;

      visitedCodes.add(code);
      countryCounts[code] = (countryCounts[code] || 0) + 1;

      const cont = COUNTRY_TO_CONTINENT[code] || null;
      if (cont) continentCounts[cont] = (continentCounts[cont] || 0) + 1;
    }

    const preferredContinent = pickTopKey(continentCounts) || null;

    const basePool = preferredContinent
      ? CONTINENT_SUGGESTIONS[preferredContinent] || []
      : [
          ...(CONTINENT_SUGGESTIONS.Europe || []),
          ...(CONTINENT_SUGGESTIONS.Asia || []),
          ...(CONTINENT_SUGGESTIONS["North America"] || []),
          ...(CONTINENT_SUGGESTIONS.Africa || []),
          ...(CONTINENT_SUGGESTIONS.Oceania || []),
          ...(CONTINENT_SUGGESTIONS["South America"] || []),
        ];

    const suggestions = [];
    for (const s of basePool) {
      if (!s?.countryCode) continue;
      const code = normalizeCountryCode(s.countryCode);
      if (!code) continue;
      if (visitedCodes.has(code)) continue;

      suggestions.push({
        country: s.country,
        countryCode: code,
        reason: preferredContinent
          ? `Based on your travel history, you seem to prefer ${preferredContinent}.`
          : "Based on popular travel patterns.",
      });

      if (suggestions.length >= 5) break;
    }

    return res.status(200).json({
      suggestions,
      meta: {
        preferredContinent,
        visitedCountriesCount: visitedCodes.size,
        totalEventsAnalyzed: rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
