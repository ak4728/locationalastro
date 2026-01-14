var map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: false
}).addTo(map);

// Initialize location geocoder control
var geocoder = L.Control.Geocoder.nominatim({
    geocodingQueryParams: {
        limit: 5,
        'accept-language': 'en'
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('locationGeocoderContainer');
    if (container) {
        // Create a proper geocoder input field
        var geocoderDiv = document.createElement('div');
        geocoderDiv.className = 'geocoder-input-container';
        
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type to search for your birth location...';
        input.className = 'geocoder-input';
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
        `;
        
        var resultsDiv = document.createElement('div');
        resultsDiv.className = 'geocoder-results';
        resultsDiv.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            margin-top: 5px;
            backdrop-filter: blur(10px);
            max-height: 200px;
            overflow-y: auto;
            display: none;
        `;
        
        geocoderDiv.appendChild(input);
        geocoderDiv.appendChild(resultsDiv);
        container.appendChild(geocoderDiv);
        
        var timeout;
        input.addEventListener('input', function() {
            var query = this.value.trim();
            clearTimeout(timeout);
            
            if (query.length >= 2) {
                timeout = setTimeout(function() {
                    searchLocation(query, resultsDiv, input);
                }, 300);
            } else {
                resultsDiv.style.display = 'none';
            }
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!geocoderDiv.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });
    }
});

function searchLocation(query, resultsDiv, input) {
    geocoder.geocode(query, function(results) {
        resultsDiv.innerHTML = '';
        if (results && results.length > 0) {
            resultsDiv.style.display = 'block';
            
            results.slice(0, 5).forEach(function(result) {
                var item = document.createElement('div');
                item.className = 'geocoder-result-item';
                item.textContent = result.name;
                item.style.cssText = `
                    color: white;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                `;
                
                item.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(102, 126, 234, 0.3)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.background = 'transparent';
                });
                
                item.addEventListener('click', function() {
                    var lat = result.center.lat;
                    var lon = result.center.lng;
                    var name = result.name;
                    
                    // Update form fields
                    input.value = name;
                    document.getElementById('birthLocation').value = name;
                    document.getElementById('birthLat').value = lat.toFixed(6);
                    document.getElementById('birthLon').value = lon.toFixed(6);
                    
                    // Show coordinates
                    document.getElementById('coordsGroup').style.display = 'block';
                    
                    // Auto-detect timezone
                    getTimezone(lat, lon);
                    
                    resultsDiv.style.display = 'none';
                    
                    console.log('Location selected:', name, 'Coordinates:', lat, lon);
                });
                
                resultsDiv.appendChild(item);
            });
        } else {
            resultsDiv.style.display = 'none';
        }
    });
}

var planets = [
    { name: 'Sun', color: '#FFD700', symbol: '☉' },
    { name: 'Moon', color: '#C0C0C0', symbol: '☽' },
    { name: 'Mercury', color: '#87CEEB', symbol: '☿' },
    { name: 'Venus', color: '#FF69B4', symbol: '♀' },
    { name: 'Mars', color: '#FF4500', symbol: '♂' },
    { name: 'Jupiter', color: '#FFA500', symbol: '♃' },
    { name: 'Saturn', color: '#8B4513', symbol: '♄' },
    { name: 'Uranus', color: '#40E0D0', symbol: '♅' },
    { name: 'Neptune', color: '#4169E1', symbol: '♆' },
    { name: 'Pluto', color: '#8A2BE2', symbol: '♇' },
    { name: 'North Node', color: '#FFE4B5', symbol: '☊' },
    { name: 'Chiron', color: '#CD853F', symbol: '⚷' },
    { name: 'Lilith', color: '#8B008B', symbol: '⚸' },
    { name: 'Part of Fortune', color: '#32CD32', symbol: '⊕' }
];

var lineTypes = ['AC', 'DC', 'MC', 'IC'];
var currentLines = [];

var interpretations = {
    'Sun': {
        'AC': 'Strong personal identity, leadership qualities, vitality and self-expression are enhanced.',
        'DC': 'Attracts confident partners, focus on relationships and collaboration.',
        'MC': 'Career recognition, authority positions, public visibility and success.',
        'IC': 'Strong family connections, sense of home and personal foundation.'
    },
    'Moon': {
        'AC': 'Emotional sensitivity, intuitive abilities, nurturing and protective instincts.',
        'DC': 'Seeks emotional security in partnerships, caring relationships.',
        'MC': 'Public service, caregiving professions, emotional connection to career.',
        'IC': 'Deep family roots, emotional home base, ancestral connections.'
    },
    'Mercury': {
        'AC': 'Enhanced communication, intellectual curiosity, quick thinking.',
        'DC': 'Mental connection with others, communicative partnerships.',
        'MC': 'Writing, teaching, media careers, intellectual reputation.',
        'IC': 'Learning environment, family communication, intellectual foundation.'
    },
    'Venus': {
        'AC': 'Personal charm, artistic talents, beauty and harmony.',
        'DC': 'Romantic relationships, artistic partnerships, social connections.',
        'MC': 'Arts, beauty, diplomatic careers, social recognition.',
        'IC': 'Beautiful home environment, family harmony, aesthetic foundation.'
    },
    'Mars': {
        'AC': 'Increased energy, assertiveness, courage and pioneering spirit.',
        'DC': 'Dynamic partnerships, potential for conflict or competition.',
        'MC': 'Military, sports, competitive careers, dynamic leadership.',
        'IC': 'Active home life, family dynamics, energetic foundation.'
    },
    'Jupiter': {
        'AC': 'Optimism, expansion, good fortune and philosophical outlook.',
        'DC': 'Beneficial partnerships, growth through relationships.',
        'MC': 'Teaching, publishing, international business, expansion of reputation.',
        'IC': 'Educational background, expansive family, philosophical foundation.'
    },
    'Saturn': {
        'AC': 'Discipline, responsibility, serious approach to life, delayed rewards.',
        'DC': 'Serious partnerships, commitment, traditional relationships.',
        'MC': 'Corporate careers, authority positions, long-term achievements.',
        'IC': 'Traditional family structure, disciplined foundation, ancestral wisdom.'
    },
    'Uranus': {
        'AC': 'Originality, innovation, independence, unconventional approach.',
        'DC': 'Unusual partnerships, freedom in relationships, unexpected encounters.',
        'MC': 'Technology, innovation, humanitarian careers, sudden changes.',
        'IC': 'Unusual family background, innovative home, breaking family patterns.'
    },
    'Neptune': {
        'AC': 'Spirituality, intuition, creativity, possible confusion about identity.',
        'DC': 'Spiritual partnerships, idealistic relationships, possible deception.',
        'MC': 'Arts, spirituality, healing careers, unclear professional direction.',
        'IC': 'Spiritual family background, psychic sensitivity, unclear foundations.'
    },
    'Pluto': {
        'AC': 'Personal transformation, intensity, power, psychological depth.',
        'DC': 'Transformative relationships, power dynamics, intense partnerships.',
        'MC': 'Psychology, investigation, transformation careers, powerful reputation.',
        'IC': 'Family secrets, transformative home life, powerful ancestral influences.'
    },
    'North Node': {
        'AC': 'Karmic destiny, soul growth, developing new identity and life path.',
        'DC': 'Destined relationships, karmic partnerships, growth through others.',
        'MC': 'Soul purpose in career, destined professional path, public mission.',
        'IC': 'Karmic family connections, ancestral healing, spiritual foundation.'
    },
    'Chiron': {
        'AC': 'Healing journey, overcoming wounds, becoming a wounded healer.',
        'DC': 'Healing through relationships, attracting wounded partners to heal.',
        'MC': 'Healing professions, teaching through personal wounds, mentorship.',
        'IC': 'Family wounds and healing, ancestral trauma work, deep healing.'
    },
    'Lilith': {
        'AC': 'Wild feminine power, rebellion, raw authenticity, shadow work.',
        'DC': 'Intense magnetic relationships, power struggles, taboo attractions.',
        'MC': 'Unconventional career, challenging authority, raw creative power.',
        'IC': 'Family shadows, suppressed feminine power, deep psychological work.'
    },
    'Part of Fortune': {
        'AC': 'Material success, good fortune, prosperity flowing through personal efforts.',
        'DC': 'Success through partnerships, shared resources, beneficial relationships.',
        'MC': 'Career prosperity, public recognition, material achievement.',
        'IC': 'Family wealth, real estate success, solid material foundation.'
    }
};

function getJulianDay(date) {
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    var hour = date.getUTCHours();
    var minute = date.getUTCMinutes();
    var second = date.getUTCSeconds();

    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;

    var jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    var jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
    
    return jd;
}

function getSiderealTime(jd, longitude) {
    var T = (jd - 2451545.0) / 36525.0;
    var theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                 0.000387933 * T * T - T * T * T / 38710000.0;
    
    theta0 = theta0 % 360;
    if (theta0 < 0) theta0 += 360;
    
    var lst = (theta0 + longitude) % 360;
    return lst;
}

function normalize360(deg) {
  deg = deg % 360;
  if (deg < 0) deg += 360;
  return deg;
}

function getPlanetPosition(planetName, jd) {
    if (planetName === 'Part of Fortune') {
        return calculatePartOfFortune(jd);
    }
    
    var T = (jd - 2451545.0) / 36525.0;
    
    var positions = {
        'Sun': {
            L: 280.46646 + 36000.76983 * T + 0.0003032 * T * T,
            omega: 0,
            e: 0.016708634 - 0.000042037 * T
        },
        'Moon': {
            L: 218.3165 + 481267.8813 * T,
            omega: 125.04 - 1934.136 * T,
            e: 0.0549
        },
        'Mercury': {
            L: 252.25 + 149472.68 * T,
            omega: 48.33 + 1.186 * T,
            e: 0.2056
        },
        'Venus': {
            L: 181.98 + 58517.82 * T,
            omega: 76.68 + 0.902 * T,
            e: 0.0068
        },
        'Mars': {
            L: 355.43 + 19140.30 * T,
            omega: 49.56 + 0.772 * T,
            e: 0.0934
        },
        'Jupiter': {
            L: 34.35 + 3034.91 * T,
            omega: 100.46 + 1.021 * T,
            e: 0.0484
        },
        'Saturn': {
            L: 50.08 + 1222.11 * T,
            omega: 113.67 + 0.877 * T,
            e: 0.0542
        },
        'Uranus': {
            L: 314.05 + 428.48 * T,
            omega: 74.01 + 0.521 * T,
            e: 0.0463
        },
        'Neptune': {
            L: 304.35 + 218.46 * T,
            omega: 131.78 + 0.685 * T,
            e: 0.0095
        },
        'Pluto': {
            L: 238.96 + 145.18 * T,
            omega: 110.30 + 0.387 * T,
            e: 0.2488
        },
        'North Node': {
            L: 125.04 - 1934.136 * T,
            omega: 0,
            e: 0
        },
        'Chiron': {
            L: 50.08 + 2368.34 * T,
            omega: 339.29 + 0.211 * T,
            e: 0.3826
        },
        'Lilith': {
            L: 83.35 + 4069.01 * T,
            omega: 0,
            e: 0
        }
    };

    var planet = positions[planetName];
    if (!planet) {
        return { ra: 0, dec: 0 };
    }

    var L = planet.L % 360;
    if (L < 0) L += 360;

    var lambda = L;
    var beta = 0;
    
    var epsilon = 23.43928;
    var epsilonRad = epsilon * Math.PI / 180;
    var lambdaRad = lambda * Math.PI / 180;
    var betaRad = beta * Math.PI / 180;

    var raRad = Math.atan2(
        Math.sin(lambdaRad) * Math.cos(epsilonRad) - Math.tan(betaRad) * Math.sin(epsilonRad),
        Math.cos(lambdaRad)
    );
    var decRad = Math.asin(
        Math.sin(betaRad) * Math.cos(epsilonRad) + Math.cos(betaRad) * Math.sin(epsilonRad) * Math.sin(lambdaRad)
    );

    var ra = raRad * 180 / Math.PI;
    if (ra < 0) ra += 360;

    var dec = decRad * 180 / Math.PI;

    return { ra: ra, dec: dec, eclLon: lambda };
}

function calculatePartOfFortune(jd) {
  // Read birth location directly from your existing inputs
  var lat = parseFloat(document.getElementById('birthLat').value);
  var lon = parseFloat(document.getElementById('birthLon').value);

  if (isNaN(lat) || isNaN(lon)) {
    return { ra: 0, dec: 0, eclLon: 0 };
  }

  // Use your existing mean obliquity constant, same as getPlanetPosition
  var epsilon = 23.43928 * Math.PI / 180;

  // Local sidereal time at birth longitude, degrees to radians
  var lstDeg = getSiderealTime(jd, lon);
  var theta = lstDeg * Math.PI / 180;

  var phi = lat * Math.PI / 180;

  // Ascendant ecliptic longitude (approx, uses spherical formula)
  var ascLonRad = Math.atan2(
    Math.sin(theta) * Math.cos(epsilon) - Math.tan(phi) * Math.sin(epsilon),
    Math.cos(theta)
  );
  var ascLon = normalize360(ascLonRad * 180 / Math.PI);

  // Get Sun and Moon ecliptic longitudes from your planet routine
  var sunPos = getPlanetPosition('Sun', jd);
  var moonPos = getPlanetPosition('Moon', jd);

  var sunLon = normalize360(sunPos.eclLon !== undefined ? sunPos.eclLon : sunPos.ra);
  var moonLon = normalize360(moonPos.eclLon !== undefined ? moonPos.eclLon : moonPos.ra);

  // Day or night check using Sun altitude at birth place
  var sunRa = sunPos.ra * Math.PI / 180;
  var sunDec = sunPos.dec * Math.PI / 180;
  var H = (lstDeg * Math.PI / 180) - sunRa;

  var alt = Math.asin(
    Math.sin(phi) * Math.sin(sunDec) + Math.cos(phi) * Math.cos(sunDec) * Math.cos(H)
  );

  var isDay = alt > 0;

  // Part of Fortune formula
  // Day chart: Asc + Moon - Sun
  // Night chart: Asc + Sun - Moon
  var pofLon = isDay
    ? normalize360(ascLon + moonLon - sunLon)
    : normalize360(ascLon + sunLon - moonLon);

  // Convert PoF ecliptic longitude (beta assumed 0) to RA and Dec like your getPlanetPosition
  var lambdaRad = pofLon * Math.PI / 180;
  var raRad = Math.atan2(
    Math.sin(lambdaRad) * Math.cos(epsilon),
    Math.cos(lambdaRad)
  );
  var decRad = Math.asin(
    Math.sin(epsilon) * Math.sin(lambdaRad)
  );

  var ra = raRad * 180 / Math.PI;
  if (ra < 0) ra += 360;

  var dec = decRad * 180 / Math.PI;

  return { ra: ra, dec: dec, eclLon: pofLon };
}


function normalize180(deg) {
    deg = normalize360(deg);
    if (deg > 180) deg -= 360;
    return deg;
}

function unwrapLongitude(lon, prevLon) {
    if (prevLon === null || prevLon === undefined) return lon;
    while (lon - prevLon > 180) lon -= 360;
    while (lon - prevLon < -180) lon += 360;
    return lon;
}

function calculateAstrocartographyLine(planetPos, birthLat, lineType, lst, jd) {
    // GMST in degrees, using existing sidereal function at Greenwich longitude 0
    var gmst = getSiderealTime(jd, 0);

    var raDeg = normalize360(planetPos.ra);
    var decDeg = planetPos.dec;
    var decRad = decDeg * Math.PI / 180;

    var points = [];

    // MC and IC are constant longitude lines
    if (lineType === 'MC' || lineType === 'IC') {
        var lstNeeded = (lineType === 'MC') ? raDeg : (raDeg + 180);
        var lon = normalize180(lstNeeded - gmst);

        for (var lat = -80; lat <= 80; lat += 2) {
            points.push([lat, lon]);
        }

        return points.length > 5 ? points : null;
    }

    // AC and DC are rising and setting lines, depend on latitude
    if (lineType === 'AC' || lineType === 'DC') {
        // At very high latitudes some bodies do not rise or set
        var maxLat = Math.min(89, 90 - Math.abs(decDeg));

        var prevLon = null;

        // Extended range to better handle polar regions
        for (var lat = -maxLat; lat <= maxLat; lat += 0.5) {
            var latRad = lat * Math.PI / 180;

            // Horizon condition: cos(H0) = -tan(phi) * tan(delta)
            var cosH0 = -Math.tan(latRad) * Math.tan(decRad);

            // No rise or set at this latitude
            if (cosH0 < -1 || cosH0 > 1) continue;

            var H0deg = Math.acos(cosH0) * 180 / Math.PI;

            // Rising: LST = RA - H0, Setting: LST = RA + H0
            var lstNeeded = (lineType === 'AC') ? (raDeg - H0deg) : (raDeg + H0deg);

            // Convert needed LST to longitude: LST = GMST + longitude
            var lon = normalize180(lstNeeded - gmst);

            // Keep continuity across the dateline
            lon = unwrapLongitude(lon, prevLon);
            prevLon = lon;

            points.push([lat, lon]);
        }

        return points.length > 5 ? points : null;
    }

    return null;
}

function generateMap() {
    var dateStr = document.getElementById('birthDate').value;
    var timeStr = document.getElementById('birthTime').value;
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    var tzOffset = parseFloat(document.getElementById('tzOffset').value);

    if (!dateStr || !timeStr) {
        alert('Please fill in birth date and time');
        return;
    }

    if (isNaN(lat) || isNaN(lon)) {
        alert('Location coordinates are missing. Please enter a valid location and wait for it to be resolved.');
        // Try geocoding the current location if coordinates are missing
        geocodeLocation();
        return;
    }

    if (isNaN(tzOffset)) {
        alert('Timezone information is missing. Please enter a valid location.');
        return;
    }

    for (var i = 0; i < currentLines.length; i++) {
        map.removeLayer(currentLines[i]);
    }
    currentLines = [];

    var dateParts = dateStr.split('-');
    var year = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]);
    var day = parseInt(dateParts[2]);
    
    var timeParts = timeStr.split(':');
    var hour = parseInt(timeParts[0]);
    var minute = parseInt(timeParts[1]);
    var second = timeParts[2] ? parseInt(timeParts[2]) : 0;

    var birthDate = new Date(Date.UTC(year, month - 1, day, hour - tzOffset, minute, second));
    
    var jd = getJulianDay(birthDate);
    var lst = getSiderealTime(jd, lon);

    var planetaryData = [];

    for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        var planetPos = getPlanetPosition(planet.name, jd);
        
        for (var j = 0; j < lineTypes.length; j++) {
            var lineType = lineTypes[j];
            var linePoints = calculateAstrocartographyLine(planetPos, lat, lineType, lst, jd);
            
            if (linePoints && linePoints.length > 0) {
                var line = L.polyline(linePoints, {
                    color: planet.color,
                    weight: 2.5,
                    opacity: 0.8,
                    smoothFactor: 1.2
                }).addTo(map);

                var interpretation = interpretations[planet.name] && interpretations[planet.name][lineType] 
                    ? interpretations[planet.name][lineType] 
                    : 'This celestial line brings the energy of ' + planet.name + ' to this location.';
                
                // Break long interpretations into multiple lines
                var formattedInterpretation = interpretation.length > 60 
                    ? interpretation.replace(/[,.] /g, function(match, offset) {
                        return offset > 30 ? match.charAt(0) + '<br>' : match;
                    })
                    : interpretation;
                
                var tooltipContent = '<div style="max-width: 250px; font-size: 0.9em; line-height: 1.3;">' +
                    '<strong style="color: ' + planet.color + ';">' + planet.symbol + ' ' + planet.name + ' ' + lineType + '</strong><br><br>' +
                    '<div style="margin: 5px 0; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 0.85em;">' +
                    formattedInterpretation + '</div>' +
                    '</div>';
                
                // Use tooltip instead of popup for hover functionality
                line.bindTooltip(tooltipContent, {
                    permanent: false,
                    direction: 'auto',
                    className: 'custom-tooltip'
                });

                currentLines.push(line);
                
                // Add planet symbols along the line at key points
                var symbolPositions = [];
                if (linePoints.length > 10) {
                    var step = Math.floor(linePoints.length / 5);
                    for (var s = 0; s < linePoints.length; s += step) {
                        if (symbolPositions.length < 5) {
                            symbolPositions.push(linePoints[s]);
                        }
                    }
                } else {
                    symbolPositions = linePoints.slice(0, 3);
                }
                
                var iconHtml = '<div style="font-size: 20px; color: ' + planet.color + '; text-shadow: 0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">' + planet.symbol + '</div>';
                var planetIcon = L.divIcon({
                    html: iconHtml,
                    className: 'planet-icon',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                for (var k = 0; k < symbolPositions.length; k++) {
                    var marker = L.marker(symbolPositions[k], {
                        icon: planetIcon
                    }).addTo(map);
                    
                    marker.bindTooltip(tooltipContent, {
                        permanent: false,
                        direction: 'auto',
                        className: 'custom-tooltip'
                    });
                    currentLines.push(marker);
                }
                
                planetaryData.push({
                    planet: planet.name,
                    symbol: planet.symbol,
                    color: planet.color
                });
            }
        }
    }

    var uniquePlanets = [];
    var seenPlanets = {};
    for (var k = 0; k < planetaryData.length; k++) {
        var p = planetaryData[k];
        if (!seenPlanets[p.planet]) {
            uniquePlanets.push(p);
            seenPlanets[p.planet] = true;
        }
    }
    
    var planetList = document.getElementById('planetList');
    var planetHTML = '';
    for (var m = 0; m < uniquePlanets.length; m++) {
        var planet = uniquePlanets[m];
        planetHTML += '<div style="display: flex; align-items: center; gap: 6px; padding: 3px; font-size: 0.8rem;">' +
            '<span style="color: ' + planet.color + '; font-size: 1rem; min-width: 18px;">' + planet.symbol + '</span>' +
            '<span style="color: #fff; flex: 1;">' + planet.planet + '</span>' +
        '</div>';
    }
    planetList.innerHTML = planetHTML;

    // Add birth location marker
    var birthLocationName = document.getElementById('birthLocation').value || 'Birth Location';
    var birthIcon = L.divIcon({
        html: '<div style="background: #ff4757; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏠</div>',
        className: 'birth-location-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    var birthMarker = L.marker([lat, lon], {
        icon: birthIcon,
        zIndexOffset: 1000
    }).addTo(map);
    
    birthMarker.bindTooltip(
        '<div style="font-size: 0.9em; text-align: center;"><strong>🏠 Birth Location</strong><br>' + 
        birthLocationName + '<br>' +
        '<small>' + lat.toFixed(4) + '°, ' + lon.toFixed(4) + '°</small></div>',
        {
            permanent: false,
            direction: 'top',
            className: 'custom-tooltip'
        }
    );
    
    currentLines.push(birthMarker);

    document.getElementById('legend').style.display = 'block';
    document.getElementById('infoBox').style.display = 'block';
}

function geocodeLocation() {
    var location = document.getElementById('birthLocation').value.trim();
    if (!location) {
        return;
    }

    // Show loading state
    document.getElementById('birthLocation').style.opacity = '0.6';
    
    var geocodeUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(location) + '&limit=1';
    
    fetch(geocodeUrl)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data && data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                document.getElementById('birthLat').value = lat.toFixed(6);
                document.getElementById('birthLon').value = lon.toFixed(6);
                
                var displayName = data[0].display_name.split(',').slice(0, 3).join(', ');
                document.getElementById('birthLocation').value = displayName;
                
                // Auto-detect timezone
                getTimezone(lat, lon);
                
                
            } else {
                console.log('Location not found:', location);
                // Only reset to defaults if current coordinates are also Istanbul defaults
                var currentLat = parseFloat(document.getElementById('birthLat').value);
                var currentLon = parseFloat(document.getElementById('birthLon').value);
                
                if (Math.abs(currentLat - 41.016667) < 0.1 && Math.abs(currentLon - 28.950000) < 0.1) {
                    // Keep Istanbul as fallback only if we're already on Istanbul coordinates
                    document.getElementById('birthLat').value = '41.016667';
                    document.getElementById('birthLon').value = '28.950000';
                    document.getElementById('tzOffset').value = '3';
                    document.getElementById('tzDisplay').value = 'Turkey Time (UTC+3)';
                }
                // If we have different coordinates, keep them (maybe user entered manually)
            }
            document.getElementById('birthLocation').style.opacity = '1';
        })
        .catch(function(error) {
            console.error('Geocoding error:', error);
            document.getElementById('birthLocation').style.opacity = '1';
        });
}

function getTimezone(lat, lon) {
    // Use TimeZoneDB or similar service for timezone detection
    // For now, use a simple approximation based on longitude
    var roughTzOffset = Math.round(lon / 15);
    
    // Common timezone corrections for major regions
    var tzName = 'UTC';
    var tzOffset = roughTzOffset;
    
    if (lon >= 28 && lon <= 32 && lat >= 36 && lat <= 42) {
        // Turkey
        tzOffset = 3;
        tzName = 'Turkey Time (UTC+3)';
    } else if (lon >= -5 && lon <= 2 && lat >= 42 && lat <= 52) {
        // Western Europe
        tzOffset = 1;
        tzName = 'Central European Time (UTC+1)';
    } else if (lon >= -125 && lon <= -67 && lat >= 25 && lat <= 49) {
        // USA
        if (lon >= -125 && lon <= -104) {
            tzOffset = -8; // Pacific
            tzName = 'Pacific Time (UTC-8)';
        } else if (lon >= -104 && lon <= -87) {
            tzOffset = -7; // Mountain
            tzName = 'Mountain Time (UTC-7)';
        } else if (lon >= -87 && lon <= -80) {
            tzOffset = -6; // Central
            tzName = 'Central Time (UTC-6)';
        } else {
            tzOffset = -5; // Eastern
            tzName = 'Eastern Time (UTC-5)';
        }
    } else {
        // Fallback to rough calculation
        tzName = 'UTC' + (tzOffset >= 0 ? '+' : '') + tzOffset;
    }
    
    document.getElementById('tzOffset').value = tzOffset;
    document.getElementById('tzDisplay').value = tzName;
}

function shareMap() {
    var params = new URLSearchParams();
    params.set('date', document.getElementById('birthDate').value);
    params.set('time', document.getElementById('birthTime').value);
    params.set('location', document.getElementById('birthLocation').value);
    params.set('lat', document.getElementById('birthLat').value);
    params.set('lon', document.getElementById('birthLon').value);
    params.set('tz', document.getElementById('tzOffset').value);
    
    var shareUrl = window.location.origin + window.location.pathname + '?' + params.toString();
    
    if (navigator.share) {
        navigator.share({
            title: 'My Astrocartography Map',
            text: 'Check out my astrocartography map showing planetary lines around the world!',
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(function() {
            alert('Map URL copied to clipboard! Share this link to show others your astrocartography map.');
        }).catch(function() {
            prompt('Copy this URL to share your map:', shareUrl);
        });
    }
}

function loadFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('date')) document.getElementById('birthDate').value = urlParams.get('date');
    if (urlParams.get('time')) document.getElementById('birthTime').value = urlParams.get('time');
    if (urlParams.get('location')) {
        document.getElementById('birthLocation').value = urlParams.get('location');
        var geoInput = document.querySelector('.geocoder-input');
        if (geoInput) geoInput.value = urlParams.get('location');
    }
    if (urlParams.get('lat')) {
        document.getElementById('birthLat').value = urlParams.get('lat');
        document.getElementById('coordsGroup').style.display = 'block';
    }
    if (urlParams.get('lon')) {
        document.getElementById('birthLon').value = urlParams.get('lon');
        document.getElementById('coordsGroup').style.display = 'block';
    }
    if (urlParams.get('tz')) {
        document.getElementById('tzOffset').value = urlParams.get('tz');
        document.getElementById('timezoneGroup').style.display = 'block';
    }
    
    if (urlParams.has('date') && urlParams.has('time')) {
        setTimeout(generateMap, 500);
    }
}

// Geocoding is now handled by Leaflet Control Geocoder
// Legacy event listeners kept for compatibility

// Toggle technical details visibility
document.getElementById('toggleTechnical').addEventListener('click', function() {
    var coordsGroup = document.getElementById('coordsGroup');
    var timezoneGroup = document.getElementById('timezoneGroup');
    var isVisible = coordsGroup.style.display !== 'none';
    
    coordsGroup.style.display = isVisible ? 'none' : 'block';
    timezoneGroup.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible ? 'Show Technical Details' : 'Hide Technical Details';
});

// Add event listeners for buttons
document.getElementById('generateBtn').addEventListener('click', function() {
    generateMap();
});
document.getElementById('shareBtn').addEventListener('click', shareMap);

window.addEventListener('load', function() {
    loadFromUrl();
    
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    
    if (isNaN(lat) || isNaN(lon)) {
        // Set default values for Istanbul, Turkey
        document.getElementById('birthLat').value = '41.016667';
        document.getElementById('birthLon').value = '28.950000';
        document.getElementById('tzOffset').value = '3';
        document.getElementById('tzDisplay').value = 'Turkey Time (UTC+3)';
        
        // Try to improve with geocoding if we have a location
        var defaultLocation = document.getElementById('birthLocation').value;
        if (defaultLocation) {
            setTimeout(function() {
                geocodeLocation();
            }, 100);
        }
    }
});