// Node test: compare astronomy-engine MoonPosition with simplified moon sign algorithm
const Astronomy = require('astronomy-engine');

const zodiacSigns = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

function parseLocalDateTime(dateStr, timeStr) {
  var datePart = String(dateStr).split('T')[0];
  var parts = datePart.split('-');
  var y = parseInt(parts[0],10);
  var m = parseInt(parts[1],10)-1;
  var d = parseInt(parts[2],10);
  if (!timeStr) return new Date(y,m,d);
  var tparts = String(timeStr).split(':');
  var hh = parseInt(tparts[0]||'0',10);
  var mm = parseInt(tparts[1]||'0',10);
  return new Date(y,m,d,hh,mm);
}

function simplifiedMoonSign(dateStr, timeStr) {
  const date = parseLocalDateTime(dateStr, timeStr);
  const dayOfMonth = date.getDate();
  const timeOffset = date.getHours() / 24 + date.getMinutes() / 1440;
  const moonCycle = ((dayOfMonth + timeOffset) * 13) % 360;
  const baseOffset = (date.getMonth() * 30 + date.getFullYear() * 365) % 360;
  const moonPosition = (moonCycle + baseOffset) % 360;
  const signIndex = Math.floor(((moonPosition % 360) + 360) % 360 / 30) % 12;
  return { name: zodiacSigns[signIndex], lon: moonPosition };
}

function preciseMoonSign(dateStr, timeStr) {
  const date = parseLocalDateTime(dateStr, timeStr);
  // astronomy-engine: use Astronomy.MoonPosition(date)
  // Use astronomy-engine's EclipticGeoMoon to get geocentric ecliptic longitude
  let lon = null;
  let pos = null;
  try {
    pos = Astronomy.EclipticGeoMoon(date);
    if (pos && (typeof pos.lon === 'number' || typeof pos.longitude === 'number')) {
      lon = pos.lon || pos.longitude;
    }
  } catch (e) {
    // fall back to other heuristics below
  }
  if (lon == null) {
    // As a last resort, try EclipticLongitude with Body.Moon
    try {
      lon = Astronomy.EclipticLongitude(date, Astronomy.Body.Moon);
    } catch (e) {
      // give up
      return { name: null, lon: null, raw: pos };
    }
  }
  const signIndex = Math.floor(((lon % 360) + 360) % 360 / 30) % 12;
  return { name: zodiacSigns[signIndex], lon: lon, raw: pos };
}

const tests = [
  {date: '2026-03-01', time: '00:00'},
  {date: '2026-02-20', time: '12:00'},
  {date: '2026-02-15', time: '06:30'},
  {date: '2021-12-04', time: '18:00'},
  {date: '1990-07-15', time: '03:45'},
  {date: '2000-01-01', time: '23:59'},
  {date: '2024-02-29', time: '10:00'},
  {date: '2023-10-28', time: '04:15'}
];

console.log('Comparing precise (astronomy-engine) vs simplified moon sign');
(async function(){
  for (const t of tests) {
    const simp = simplifiedMoonSign(t.date, t.time);
    const prec = preciseMoonSign(t.date, t.time);
    console.log(`${t.date} ${t.time} -> precise: ${prec.name || 'N/A'} (lon=${prec.lon}) | simple: ${simp.name} (lon=${simp.lon.toFixed(2)})`);
  }
})();
