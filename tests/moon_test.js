// Test harness for getMoonSign (matches script.js simplified algorithm)
var zodiacSigns = [
    {name: 'Aries', symbol: '♈'},
    {name: 'Taurus', symbol: '♉'},
    {name: 'Gemini', symbol: '♊'},
    {name: 'Cancer', symbol: '♋'},
    {name: 'Leo', symbol: '♌'},
    {name: 'Virgo', symbol: '♍'},
    {name: 'Libra', symbol: '♎'},
    {name: 'Scorpio', symbol: '♏'},
    {name: 'Sagittarius', symbol: '♐'},
    {name: 'Capricorn', symbol: '♑'},
    {name: 'Aquarius', symbol: '♒'},
    {name: 'Pisces', symbol: '♓'}
];

function parseLocalDateTime(dateStr, timeStr) {
    // build local Date from YYYY-MM-DD and HH:MM (optional)
    var datePart = String(dateStr).split('T')[0];
    var parts = datePart.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    if (!timeStr) timeStr = '00:00';
    var tparts = String(timeStr).split(':');
    var hh = parseInt(tparts[0] || '0', 10);
    var mm = parseInt(tparts[1] || '0', 10);
    return new Date(y, m, d, hh, mm);
}

function getMoonSign(birthDate, birthTime, lat, lon) {
    try {
        var date = parseLocalDateTime(birthDate, birthTime);
        var startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        var dayOfMonth = date.getDate();
        var timeOffset = date.getHours() / 24;
        var moonCycle = ((dayOfMonth + timeOffset) * 13) % 360;
        var baseOffset = (date.getMonth() * 30 + date.getFullYear() * 365) % 360;
        var moonPosition = (moonCycle + baseOffset) % 360;
        var signIndex = Math.floor(moonPosition / 30) % 12;
        return zodiacSigns[signIndex];
    } catch (error) {
        var sunIndex = 0;
        return zodiacSigns[(sunIndex + 4) % 12];
    }
}

var tests = [
    {date: '2026-03-01', time: '00:00', lat: 40.7, lon: -74.0},
    {date: '2026-02-20', time: '12:00', lat: 51.5, lon: -0.1},
    {date: '2026-02-15', time: '06:30', lat: 34.05, lon: -118.25},
    {date: '2021-12-04', time: '18:00', lat: 35.7, lon: 139.7},
    {date: '1990-07-15', time: '03:45', lat: 52.52, lon: 13.4},
    {date: '2000-01-01', time: '23:59', lat: -33.9, lon: 151.2},
    {date: '2024-02-29', time: '10:00', lat: 0, lon: 0},
    {date: '2023-10-28', time: '04:15', lat: 48.85, lon: 2.35}
];

console.log('Moon sign test (simplified algorithm)');
for (var t of tests) {
    var m = getMoonSign(t.date, t.time, t.lat, t.lon);
    console.log(t.date + ' ' + t.time + ' @' + t.lat + ',' + t.lon + ' -> ' + m.name + ' ' + m.symbol);
}
