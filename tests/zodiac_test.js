// Test harness for getZodiacSign
var zodiacSigns = [
    {name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19]},
    {name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20]},
    {name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 21]},
    {name: 'Cancer', symbol: '♋', start: [6, 22], end: [7, 22]},
    {name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22]},
    {name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22]},
    {name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 23]},
    {name: 'Scorpio', symbol: '♏', start: [10, 24], end: [11, 21]},
    {name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21]},
    {name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19]},
    {name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18]},
    {name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20]}
];

function getZodiacSign(birthDate) {
    // Normalize to avoid timezone shifts
    var date;
    if (birthDate instanceof Date) {
        date = birthDate;
    } else {
        var s = String(birthDate);
        var datePart = s.split('T')[0];
        var parts = datePart.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            var y = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10) - 1;
            var d = parseInt(parts[2], 10);
            date = new Date(y, m, d);
        } else {
            date = new Date(birthDate);
        }
    }
    var month = date.getMonth() + 1;
    var day = date.getDate();
    
    for (var i = 0; i < zodiacSigns.length; i++) {
        var sign = zodiacSigns[i];
        var startMonth = sign.start[0];
        var startDay = sign.start[1];
        var endMonth = sign.end[0];
        var endDay = sign.end[1];
        
        if (startMonth > endMonth) {
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay) ||
                (month > startMonth || month < endMonth)) {
                return sign;
            }
        } else {
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay) ||
                (month > startMonth && month < endMonth)) {
                return sign;
            }
        }
    }
    return zodiacSigns[0];
}

var tests = [
    {date: '1990-03-20', expect: 'Pisces'},
    {date: '1990-03-21', expect: 'Aries'},
    {date: '1990-04-19', expect: 'Aries'},
    {date: '1990-04-20', expect: 'Taurus'},
    {date: '1990-12-21', expect: 'Sagittarius'},
    {date: '1990-12-22', expect: 'Capricorn'},
    {date: '1990-01-19', expect: 'Capricorn'},
    {date: '1990-01-20', expect: 'Aquarius'},
    {date: '1990-02-18', expect: 'Aquarius'},
    {date: '1990-02-19', expect: 'Pisces'},
    {date: '1992-02-29', expect: 'Pisces'},
    {date: '1990-12-31', expect: 'Capricorn'}
];

console.log('Running zodiac sign tests...');
var failures = 0;
for (var t of tests) {
    var d = new Date(t.date);
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    console.log('  parsed ->', mm + '-' + dd);
    var sign = getZodiacSign(t.date);
    var ok = sign.name === t.expect;
    console.log(t.date + ' -> ' + sign.name + (ok ? ' ✓' : ' ✗ (expected ' + t.expect + ')'));
    if (!ok) failures++;
}

console.log('\nTotal tests:', tests.length, 'Failures:', failures);
process.exit(failures > 0 ? 1 : 0);
