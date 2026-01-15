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

// Smooth scrolling navigation
document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Handle scroll spy for navigation
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
});

// Initialize location geocoder control
var geocoder = L.Control.Geocoder.nominatim({
    geocodingQueryParams: {
        limit: 5,
        'accept-language': 'en'
    }
});

// Enhanced geocoder functionality for new design
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(initializeGeocoderInput, 100);
    
    // Initialize legend toggle functionality
    initializeLegendToggle();
});

function initializeLegendToggle() {
    const legendToggle = document.getElementById('legendToggle');
    const technicalToggle = document.getElementById('toggleTechnical');
    const legend = document.getElementById('legend');
    
    // Handle legend toggle from the new button
    if (legendToggle && legend) {
        legendToggle.addEventListener('click', function() {
            const isVisible = legend.style.display !== 'none';
            legend.style.display = isVisible ? 'none' : 'block';
            
            // Update button text
            const icon = this.querySelector('span');
            if (icon) {
                icon.textContent = isVisible ? '📖' : '📜';
            }
        });
    }
    
    // Handle technical details toggle (keep existing functionality)
    if (technicalToggle && legend) {
        technicalToggle.addEventListener('click', function() {
            const isVisible = legend.style.display !== 'none';
            legend.style.display = isVisible ? 'none' : 'block';
            
            this.textContent = isVisible ? '🔭 Show Technical Details' : '🔭 Hide Technical Details';
        });
    }
}

function initializeGeocoderInput() {
    var container = document.getElementById('locationGeocoderContainer');
    if (container) {
        // Create a proper geocoder input field
        var geocoderDiv = document.createElement('div');
        geocoderDiv.className = 'geocoder-input-container';
        geocoderDiv.style.position = 'relative';
        
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search for your birth location...';
        input.className = 'geocoder-input';
        
        var resultsDiv = document.createElement('div');
        resultsDiv.className = 'geocoder-results';
        resultsDiv.style.cssText = `
            background: var(--glass-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-top: 5px;
            backdrop-filter: blur(20px);
            max-height: 200px;
            overflow-y: auto;
            display: none;
            box-shadow: var(--card-shadow);
            position: absolute;
            width: 100%;
            z-index: 1000;
        `;
        
        geocoderDiv.appendChild(input);
        geocoderDiv.appendChild(resultsDiv);
        container.appendChild(geocoderDiv);
        
        // Show initial hidden location in the visible input
        input.value = document.getElementById('birthLocation').value || '';
        
        // Enter key should run a search and auto pick top result
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var query = this.value.trim();
                if (query.length >= 2) {
                    searchLocation(query, resultsDiv, input, true); // autoSelectTop = true
                }
            }
        });
        
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
}

let _geoAbort = null;

function _showGeoStatus(resultsDiv, text) {
  resultsDiv.innerHTML = `
    <div style="padding:10px 12px; color: rgba(255,255,255,0.8);">
      ${text}
    </div>
  `;
  resultsDiv.style.display = 'block';
}

function _applyGeoSelection(name, lat, lon, input, resultsDiv) {
  input.value = name;
  document.getElementById('birthLocation').value = name;
  document.getElementById('birthLat').value = (+lat).toFixed(6);
  document.getElementById('birthLon').value = (+lon).toFixed(6);

  document.getElementById('coordsGroup').style.display = 'block';
  document.getElementById('timezoneGroup').style.display = 'block';
  getTimezone(+lat, +lon);

  resultsDiv.style.display = 'none';
}

async function searchLocation(query, resultsDiv, input, autoSelectTop) {
  // Make dropdown behave like a dropdown (above map, not clipped)
  resultsDiv.style.position = 'absolute';
  resultsDiv.style.left = '0';
  resultsDiv.style.right = '0';
  resultsDiv.style.top = 'calc(100% + 6px)';
  resultsDiv.style.zIndex = '99999';

  // Cancel previous request
  if (_geoAbort) _geoAbort.abort();
  _geoAbort = new AbortController();

  _showGeoStatus(resultsDiv, 'Searching…');

  const url =
    'https://photon.komoot.io/api/' +
    '?q=' + encodeURIComponent(query) +
    '&limit=5';

  try {
    const resp = await fetch(url, {
      signal: _geoAbort.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    const data = await resp.json();

    const features = (data && data.features) ? data.features : [];
    if (features.length === 0) {
      resultsDiv.style.display = 'none';
      return;
    }

    // Auto select top result for Enter key
    if (autoSelectTop) {
      const top = features[0];
      const name = top.properties && top.properties.name ? top.properties.name : query;
      const lat = top.geometry.coordinates[1];
      const lon = top.geometry.coordinates[0];
      _applyGeoSelection(name, lat, lon, input, resultsDiv);
      return;
    }

    // Render dropdown items
    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';

    features.slice(0, 5).forEach((f) => {
      const nameParts = [];
      if (f.properties && f.properties.name) nameParts.push(f.properties.name);
      if (f.properties && f.properties.state) nameParts.push(f.properties.state);
      if (f.properties && f.properties.country) nameParts.push(f.properties.country);
      const name = nameParts.join(', ') || query;

      const lat = f.geometry.coordinates[1];
      const lon = f.geometry.coordinates[0];

      const item = document.createElement('div');
      item.className = 'geocoder-result-item';
      item.textContent = name;
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
        _applyGeoSelection(name, lat, lon, input, resultsDiv);
      });

      resultsDiv.appendChild(item);
    });
  } catch (err) {
    // Abort is expected during fast typing
    if (err && err.name === 'AbortError') return;

    console.error('Geocode search failed:', err);
    _showGeoStatus(resultsDiv, 'Could not reach geocoding service. Try again, or press Enter.');
  }
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

function jdToDateUTC(jd) {
  // JD 2440587.5 = Unix epoch in JD
  return new Date((jd - 2440587.5) * 86400000);
}

function meanObliquityRad(jd) {
  // Meeus mean obliquity (good enough here)
  var T = (jd - 2451545.0) / 36525.0;
  var epsArcSec = 84381.448 - 46.8150*T - 0.00059*T*T + 0.001813*T*T*T;
  return (epsArcSec / 3600) * Math.PI / 180;
}

function equatorialToEcliptic(raDeg, decDeg, jd) {
  var eps = meanObliquityRad(jd);
  var a = raDeg * Math.PI / 180;
  var d = decDeg * Math.PI / 180;

  // Convert unit vector in equatorial to ecliptic
  var x = Math.cos(d) * Math.cos(a);
  var y = Math.cos(d) * Math.sin(a);
  var z = Math.sin(d);

  // Rotate around X-axis by +eps (equatorial -> ecliptic)
  var y2 = y * Math.cos(eps) + z * Math.sin(eps);
  var z2 = -y * Math.sin(eps) + z * Math.cos(eps);

  var lon = Math.atan2(y2, x) * 180 / Math.PI;
  if (lon < 0) lon += 360;

  var lat = Math.asin(z2) * 180 / Math.PI;
  return { lon: lon, lat: lat };
}

function ascendantEclLon(latDeg, lonDeg, jd) {
  // Use LST = GMST + longitude
  var gmst = getSiderealTime(jd, 0);
  var lstDeg = normalize360(gmst + lonDeg);

  var eps = meanObliquityRad(jd);
  var theta = lstDeg * Math.PI / 180;
  var phi = latDeg * Math.PI / 180;

  // Standard ascendant formula
  var asc = Math.atan2(
    Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps),
    Math.cos(theta)
  );

  var ascDeg = asc * 180 / Math.PI;
  ascDeg = normalize360(ascDeg);
  
  // Quadrant fix: ensure ascendant is the eastern horizon intersection
  // If asc is on the western side, flip by 180
  var test = angularDiffDeg(ascDeg, lstDeg);
  if (test > 0) ascDeg = normalize360(ascDeg + 180);
  
  return ascDeg;
}

function angularDiffDeg(a, b) {
  // a-b in (-180, +180]
  return normalize180(a - b);
}

function solveLongitudeForAscTarget(latDeg, targetAscLon, jd, prevLon) {
  // scan longitudes, find sign changes, then bisection refine
  var step = 6;   // degrees - larger step for more robust scanning
  var roots = [];

  var lon0 = -180;
  var f0 = angularDiffDeg(ascendantEclLon(latDeg, lon0, jd), targetAscLon);

  for (var lon = lon0 + step; lon <= 180; lon += step) {
    var f1 = angularDiffDeg(ascendantEclLon(latDeg, lon, jd), targetAscLon);

    // exact hit
    if (Math.abs(f1) < 0.1) {
      roots.push(lon);
      f0 = f1;
      continue;
    }

    // sign change means a root in (lon-step, lon)
    if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) {
      var a = lon - step;
      var b = lon;
      var fa = f0;

      // Bisection refinement
      for (var i = 0; i < 25; i++) { // More iterations for precision
        var m = (a + b) / 2;
        var fm = angularDiffDeg(ascendantEclLon(latDeg, m, jd), targetAscLon);

        if (Math.abs(fm) < 0.01) break; // Good enough precision

        if ((fa <= 0 && fm >= 0) || (fa >= 0 && fm <= 0)) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }
      roots.push((a + b) / 2);
    }

    f0 = f1;
  }

  if (roots.length === 0) return null;

  // If we have a previous longitude preference (for continuity)
  if (prevLon !== null && prevLon !== undefined) {
    var best = roots[0];
    var bestDist = Math.abs(unwrapLongitude(best, prevLon) - prevLon);
    for (var r = 1; r < roots.length; r++) {
      var candidate = unwrapLongitude(roots[r], prevLon);
      var dist = Math.abs(candidate - prevLon);
      if (dist < bestDist) {
        bestDist = dist;
        best = roots[r];
      }
    }
    return best;
  }

  return roots[0];
}

// Zodio helpers, compute relocated angles in zodiac, then solve lon where angle equals planet lon

function zodioMcEclLonFromLST(lstDeg, jd) {
  // MC zodiac longitude depends only on LST and obliquity.
  // tan(lambda) = tan(LST) / cos(eps)
  var eps = meanObliquityRad(jd);
  var th = (normalize360(lstDeg) * Math.PI) / 180;

  var lam = Math.atan2(Math.sin(th) * Math.cos(eps), Math.cos(th)) * 180 / Math.PI;
  return normalize360(lam);
}

function zodioAscEclLonFromLST(latDeg, lstDeg, jd) {
  // Ascendant zodiac longitude, standard formula
  var eps = meanObliquityRad(jd);
  var th = (normalize360(lstDeg) * Math.PI) / 180;
  var phi = (latDeg * Math.PI) / 180;

  var lam = Math.atan2(
    Math.sin(th) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps),
    Math.cos(th)
  ) * 180 / Math.PI;

  lam = normalize360(lam);

  // Ensure we return the Ascendant, not the Descendant, by forcing the eastern intersection.
  // This stabilizes the curve and prevents branch flips.
  // If the point is on the western side, flip by 180.
  var lst = normalize360(lstDeg);
  var d = normalize180(lam - lst);
  if (d > 0) lam = normalize360(lam + 180);

  return lam;
}

function zodioAngleDiffDeg(aDeg, bDeg) {
  // returns a-b wrapped to (-180, 180]
  return normalize180(aDeg - bDeg);
}

function zodioSolveLonForTarget(latDeg, jd, targetEclLon, angleFn, preferLonDeg) {
  // Scan longitude, bracket sign changes, refine by bisection, choose root closest to preferLonDeg.
  var gmst = getSiderealTime(jd, 0);

  var step = 2;   // degrees, smaller is smoother, larger is faster
  var roots = [];

  function f(lonDeg) {
    var lstDeg = normalize360(gmst + lonDeg);
    var ang = angleFn(latDeg, lstDeg, jd);             // 0..360
    return zodioAngleDiffDeg(ang, targetEclLon);       // -180..180
  }

  var lon0 = -180;
  var f0 = f(lon0);

  for (var lon = lon0 + step; lon <= 180; lon += step) {
    var f1 = f(lon);

    // close enough
    if (Math.abs(f1) < 0.25) {
      roots.push(lon);
      f0 = f1;
      continue;
    }

    // sign change means root in (lon-step, lon)
    if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) {
      var a = lon - step;
      var b = lon;
      var fa = f0;

      for (var i = 0; i < 25; i++) {
        var m = (a + b) / 2;
        var fm = f(m);

        if (Math.abs(fm) < 0.01) { a = b = m; break; }

        if ((fa <= 0 && fm >= 0) || (fa >= 0 && fm <= 0)) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }

      roots.push((a + b) / 2);
    }

    f0 = f1;
  }

  if (roots.length === 0) return null;

  // Choose best root, closest to preferLonDeg (continuity anchor).
  var best = roots[0];
  var bestDist = Math.abs(unwrapLongitude(best, preferLonDeg) - preferLonDeg);

  for (var r = 1; r < roots.length; r++) {
    var cand = roots[r];
    var dist = Math.abs(unwrapLongitude(cand, preferLonDeg) - preferLonDeg);
    if (dist < bestDist) {
      bestDist = dist;
      best = cand;
    }
  }

  return best;
}

function zodioSolveLonForMC(jd, targetMcLon, preferLonDeg) {
  // MC does not depend on latitude, so solve lon where MC(lon) = targetMcLon.
  // Uses same scan and bisection pattern as above.
  var gmst = getSiderealTime(jd, 0);
  var step = 2;
  var roots = [];

  function f(lonDeg) {
    var lstDeg = normalize360(gmst + lonDeg);
    var mc = zodioMcEclLonFromLST(lstDeg, jd);
    return zodioAngleDiffDeg(mc, targetMcLon);
  }

  var lon0 = -180;
  var f0 = f(lon0);

  for (var lon = lon0 + step; lon <= 180; lon += step) {
    var f1 = f(lon);

    if (Math.abs(f1) < 0.25) {
      roots.push(lon);
      f0 = f1;
      continue;
    }

    if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) {
      var a = lon - step;
      var b = lon;
      var fa = f0;

      for (var i = 0; i < 25; i++) {
        var m = (a + b) / 2;
        var fm = f(m);

        if (Math.abs(fm) < 0.01) { a = b = m; break; }

        if ((fa <= 0 && fm >= 0) || (fa >= 0 && fm <= 0)) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }

      roots.push((a + b) / 2);
    }

    f0 = f1;
  }

  if (roots.length === 0) return null;

  var best = roots[0];
  var bestDist = Math.abs(unwrapLongitude(best, preferLonDeg) - preferLonDeg);

  for (var r = 1; r < roots.length; r++) {
    var cand = roots[r];
    var dist = Math.abs(unwrapLongitude(cand, preferLonDeg) - preferLonDeg);
    if (dist < bestDist) {
      bestDist = dist;
      best = cand;
    }
  }

  return best;
}

function getPlanetPosition(planetName, jd) {
    // Keep PoF logic as-is, it will benefit from better Sun/Moon positions.
    if (planetName === 'Part of Fortune') {
        return calculatePartOfFortune(jd);
    }

    // Prefer Astronomy Engine for real ephemeris.
    // It supports: Sun, Moon, Mercury..Pluto.
    if (typeof Astronomy !== 'undefined') {
        var supported = {
            'Sun': 'Sun',
            'Moon': 'Moon',
            'Mercury': 'Mercury',
            'Venus': 'Venus',
            'Mars': 'Mars',
            'Jupiter': 'Jupiter',
            'Saturn': 'Saturn',
            'Uranus': 'Uranus',
            'Neptune': 'Neptune',
            'Pluto': 'Pluto'
        };

        if (supported[planetName]) {
            var date = jdToDateUTC(jd);
            var time = Astronomy.MakeTime(date);

            // Use GeoVector for geocentric coordinates (no observer needed)
            var geoVec = Astronomy.GeoVector(supported[planetName], time, true); // true for aberration
            
            // Convert geocentric vector to RA/Dec manually
            var ra = Math.atan2(geoVec.y, geoVec.x) * 180 / Math.PI;
            if (ra < 0) ra += 360;
            
            var rho = Math.sqrt(geoVec.x * geoVec.x + geoVec.y * geoVec.y);
            var dec = Math.atan2(geoVec.z, rho) * 180 / Math.PI;

            var ecl = equatorialToEcliptic(ra, dec, jd);

            return {
                ra: normalize360(ra),
                dec: dec,
                eclLon: normalize360(ecl.lon),
                eclLat: ecl.lat
            };
        }
    }

    // Fallback: your old approximation for unsupported points (Node/Lilith/Chiron),
    // or if Astronomy Engine isn't loaded.
    var T = (jd - 2451545.0) / 36525.0;

    var positions = {
        'North Node': { L: 125.04 - 1934.136 * T },
        'Chiron':     { L: 50.08 + 2368.34 * T },
        'Lilith':     { L: 83.35 + 4069.01 * T }
    };

    var p = positions[planetName];
    if (!p) return { ra: 0, dec: 0, eclLon: 0 };

    var lambda = normalize360(p.L);
    var eps = meanObliquityRad(jd);

    var lam = lambda * Math.PI / 180;
    var raRad = Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam));
    var decRad = Math.asin(Math.sin(eps) * Math.sin(lam));

    var ra = raRad * 180 / Math.PI;
    if (ra < 0) ra += 360;

    var dec = decRad * 180 / Math.PI;

    return { ra: ra, dec: dec, eclLon: lambda, eclLat: 0 };
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

// Zodio helpers, compute relocated angles in zodiac, then solve lon where angle equals planet lon

function zodioMcEclLonFromLST(lstDeg, jd) {
  // MC zodiac longitude depends only on LST and obliquity.
  // tan(lambda) = tan(LST) / cos(eps)
  var eps = meanObliquityRad(jd);
  var th = (normalize360(lstDeg) * Math.PI) / 180;

  var lam = Math.atan2(Math.sin(th) * Math.cos(eps), Math.cos(th)) * 180 / Math.PI;
  return normalize360(lam);
}

function zodioAscEclLonFromLST(latDeg, lstDeg, jd) {
  // Ascendant zodiac longitude, standard formula
  var eps = meanObliquityRad(jd);
  var th = (normalize360(lstDeg) * Math.PI) / 180;
  var phi = (latDeg * Math.PI) / 180;

  var lam = Math.atan2(
    Math.sin(th) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps),
    Math.cos(th)
  ) * 180 / Math.PI;

  lam = normalize360(lam);

  // Ensure we return the Ascendant, not the Descendant, by forcing the eastern intersection.
  // This stabilizes the curve and prevents branch flips.
  // If the point is on the western side, flip by 180.
  var lst = normalize360(lstDeg);
  var d = normalize180(lam - lst);
  if (d > 0) lam = normalize360(lam + 180);

  return lam;
}

function zodioAngleDiffDeg(aDeg, bDeg) {
  // returns a-b wrapped to (-180, 180]
  return normalize180(aDeg - bDeg);
}

function zodioSolveLonForTarget(latDeg, jd, targetEclLon, angleFn, preferLonDeg) {
  // Scan longitude, bracket sign changes, refine by bisection, choose root closest to preferLonDeg.
  var gmst = getSiderealTime(jd, 0);

  var step = 2;   // degrees, smaller is smoother, larger is faster
  var roots = [];

  function f(lonDeg) {
    var lstDeg = normalize360(gmst + lonDeg);
    var ang = angleFn(latDeg, lstDeg, jd);             // 0..360
    return zodioAngleDiffDeg(ang, targetEclLon);       // -180..180
  }

  var lon0 = -180;
  var f0 = f(lon0);

  for (var lon = lon0 + step; lon <= 180; lon += step) {
    var f1 = f(lon);

    // close enough
    if (Math.abs(f1) < 0.25) {
      roots.push(lon);
      f0 = f1;
      continue;
    }

    // sign change means root in (lon-step, lon)
    if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) {
      var a = lon - step;
      var b = lon;
      var fa = f0;

      for (var i = 0; i < 25; i++) {
        var m = (a + b) / 2;
        var fm = f(m);

        if (Math.abs(fm) < 0.01) { a = b = m; break; }

        if ((fa <= 0 && fm >= 0) || (fa >= 0 && fm <= 0)) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }

      roots.push((a + b) / 2);
    }

    f0 = f1;
  }

  if (roots.length === 0) return null;

  // Choose best root, closest to preferLonDeg (continuity anchor).
  var best = roots[0];
  var bestDist = Math.abs(unwrapLongitude(best, preferLonDeg) - preferLonDeg);

  for (var r = 1; r < roots.length; r++) {
    var cand = roots[r];
    var dist = Math.abs(unwrapLongitude(cand, preferLonDeg) - preferLonDeg);
    if (dist < bestDist) {
      bestDist = dist;
      best = cand;
    }
  }

  return best;
}

function zodioSolveLonForMC(jd, targetMcLon, preferLonDeg) {
  // MC does not depend on latitude, so solve lon where MC(lon) = targetMcLon.
  // Uses same scan and bisection pattern as above.
  var gmst = getSiderealTime(jd, 0);
  var step = 2;
  var roots = [];

  function f(lonDeg) {
    var lstDeg = normalize360(gmst + lonDeg);
    var mc = zodioMcEclLonFromLST(lstDeg, jd);
    return zodioAngleDiffDeg(mc, targetMcLon);
  }

  var lon0 = -180;
  var f0 = f(lon0);

  for (var lon = lon0 + step; lon <= 180; lon += step) {
    var f1 = f(lon);

    if (Math.abs(f1) < 0.25) {
      roots.push(lon);
      f0 = f1;
      continue;
    }

    if ((f0 <= 0 && f1 >= 0) || (f0 >= 0 && f1 <= 0)) {
      var a = lon - step;
      var b = lon;
      var fa = f0;

      for (var i = 0; i < 25; i++) {
        var m = (a + b) / 2;
        var fm = f(m);

        if (Math.abs(fm) < 0.01) { a = b = m; break; }

        if ((fa <= 0 && fm >= 0) || (fa >= 0 && fm <= 0)) {
          b = m;
        } else {
          a = m;
          fa = fm;
        }
      }

      roots.push((a + b) / 2);
    }

    f0 = f1;
  }

  if (roots.length === 0) return null;

  var best = roots[0];
  var bestDist = Math.abs(unwrapLongitude(best, preferLonDeg) - preferLonDeg);

  for (var r = 1; r < roots.length; r++) {
    var cand = roots[r];
    var dist = Math.abs(unwrapLongitude(cand, preferLonDeg) - preferLonDeg);
    if (dist < bestDist) {
      bestDist = dist;
      best = cand;
    }
  }

  return best;
}



function calculateAstrocartographyLine(planetPos, birthLat, lineType, lst, jd) {
    // Pure Mundo (Local Space) system using astronomical rise/set calculations
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

// Calculate aspectary lines (90°, 120°, etc. aspects to chart angles)
function calculateAspectaryLine(planetPos, angleType, jd, aspectDegrees) {
    var points = [];
    var gmst = getSiderealTime(jd, 0);
    var planetRA = normalize360(planetPos.ra);
    var planetDec = planetPos.dec;
    var decRad = planetDec * Math.PI / 180;
    
    // For aspectary lines, we find where the planet forms the specified aspect 
    // to the chart angle (AC or MC) at each latitude
    
    if (angleType === 'AC') {
        // Square aspect to Ascendant: where planet is 90° from rising
        var maxLat = Math.min(89, 90 - Math.abs(planetDec));
        var prevLon = null;
        
        for (var lat = -maxLat; lat <= maxLat; lat += 0.5) {
            var latRad = lat * Math.PI / 180;
            var cosH0 = -Math.tan(latRad) * Math.tan(decRad);
            
            if (cosH0 < -1 || cosH0 > 1) continue;
            
            var H0deg = Math.acos(cosH0) * 180 / Math.PI;
            var risingLST = planetRA - H0deg;
            
            // Add/subtract aspect degrees to find aspectary longitude
            var aspectLST1 = normalize360(risingLST + aspectDegrees);
            var aspectLST2 = normalize360(risingLST - aspectDegrees);
            
            var lon1 = normalize180(aspectLST1 - gmst);
            var lon2 = normalize180(aspectLST2 - gmst);
            
            // Choose the longitude with better continuity
            var bestLon = (prevLon === null) ? lon1 : 
                (Math.abs(unwrapLongitude(lon1, prevLon) - prevLon) < 
                 Math.abs(unwrapLongitude(lon2, prevLon) - prevLon)) ? lon1 : lon2;
            
            bestLon = unwrapLongitude(bestLon, prevLon);
            prevLon = bestLon;
            
            points.push([lat, bestLon]);
        }
    } else if (angleType === 'MC') {
        // Square aspect to Midheaven: 90° from culmination
        var aspectRA1 = normalize360(planetRA + aspectDegrees);
        var aspectRA2 = normalize360(planetRA - aspectDegrees);
        
        var lon1 = normalize180(aspectRA1 - gmst);
        var lon2 = normalize180(aspectRA2 - gmst);
        
        // Return TWO separate lines, not one combined line
        var lineA = [];
        var lineB = [];
        
        for (var lat = -80; lat <= 80; lat += 2) lineA.push([lat, lon1]);
        for (var lat = -80; lat <= 80; lat += 2) lineB.push([lat, lon2]);
        
        return [lineA, lineB];
    }
    
    return points.length > 5 ? points : null;
}

// Convert ecliptic longitude to Right Ascension (assuming beta = 0)
function eclLonToRAdeg(lambdaDeg) {
    var eps = 23.43928 * Math.PI / 180; // obliquity
    var lam = (lambdaDeg * Math.PI) / 180;
    var ra = Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) * 180 / Math.PI;
    if (ra < 0) ra += 360;
    return ra;
}

function calculateZodioLine(planetPos, birthLat, lineType, jd, tzOffset) {
    console.log('Calculating Zodio', lineType, 'for', planetPos.eclLon ? 'eclLon=' + planetPos.eclLon.toFixed(2) : 'ra=' + planetPos.ra.toFixed(2));
    var points = [];

    var planetLon = normalize360(
        planetPos.eclLon !== undefined ? planetPos.eclLon : planetPos.ra
    );

    // MC / IC (no latitude dependence)
    if (lineType === 'MC' || lineType === 'IC') {
        var targetMc = (lineType === 'MC') ? planetLon : normalize360(planetLon + 180);

        var lon = zodioSolveLonForMC(jd, targetMc, 0);
        if (lon === null) return null;

        lon = normalize180(lon);

        for (var lat = -80; lat <= 80; lat += 2) {
            points.push([lat, lon]);
        }
        console.log('Zodio', lineType, 'found', points.length, 'points (MC in zodiac =', targetMc.toFixed(2) + '°)');
        return points;
    }

    // AC / DC (latitude dependent)
    if (lineType === 'AC' || lineType === 'DC') {
        var targetAsc = (lineType === 'AC') ? planetLon : normalize360(planetLon - 180);

        var prevLon = null;

        for (var lat = -80; lat <= 80; lat += 1) {
            if (Math.abs(lat) > 85) continue;

            var prefer = (prevLon === null) ? 0 : prevLon;

            var lon2 = zodioSolveLonForTarget(
                lat,
                jd,
                targetAsc,
                zodioAscEclLonFromLST,
                prefer
            );

            if (lon2 === null) continue;

            lon2 = normalize180(lon2);
            lon2 = unwrapLongitude(lon2, prevLon);
            prevLon = lon2;

            points.push([lat, lon2]);
        }

        console.log('Zodio', lineType, 'found', points.length, 'points (AC in zodiac =', targetAsc.toFixed(2) + '°)');
        return points.length > 5 ? points : null;
    }
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
            
            // Branch based on coordinate system
            var linePoints;
            if (document.getElementById('coordinateSystem').value === 'zodio') {
                linePoints = calculateZodioLine(planetPos, lat, lineType, jd, tzOffset);
                console.log('Using Zodio calculation for', planet.name, lineType);
            } else {
                linePoints = calculateAstrocartographyLine(planetPos, lat, lineType, lst, jd);
                console.log('Using Mundo calculation for', planet.name, lineType);
            }
            
            // Skip if no valid points (e.g., disabled Zodio AC/DC)
            if (!linePoints || linePoints.length === 0) {
                console.log('Skipping', planet.name, lineType, '- no valid points');
                continue;
            }
            
            var line = L.polyline(linePoints, {
                color: planet.color,
                weight: 2.5,
                opacity: 0.8,
                smoothFactor: 1.2
            }).addTo(map);

            // Add aspectary lines for Zodio mode (90° squares) - TEMPORARILY DISABLED FOR DEBUGGING
            /*
            if (document.getElementById('coordinateSystem').value === 'zodio' && 
                (lineType === 'AC' || lineType === 'MC')) {
                
                // Calculate 90° aspectary lines (squares)
                var aspectPoints = calculateAspectaryLine(planetPos, lineType, jd, 90);
                console.log('Aspectary points for', planet.name, lineType, ':', aspectPoints);
                
                function drawAspectPolyline(pts, planet, lineType) {
                    if (!pts || !Array.isArray(pts) || pts.length === 0) {
                        console.log('Invalid aspectary points for', planet.name, lineType, ':', pts);
                        return;
                    }
                    
                    // Validate that all points are valid [lat, lon] pairs
                    for (var i = 0; i < pts.length; i++) {
                        if (!Array.isArray(pts[i]) || pts[i].length !== 2 || 
                            typeof pts[i][0] !== 'number' || typeof pts[i][1] !== 'number' ||
                            isNaN(pts[i][0]) || isNaN(pts[i][1])) {
                            console.log('Invalid point at index', i, ':', pts[i]);
                            return;
                        }
                    }
                    
                    var aspectLine = L.polyline(pts, {
                        color: planet.color,
                        weight: 1.5,
                        opacity: 0.4,
                        dashArray: '8,4',
                        smoothFactor: 1.2
                    }).addTo(map);
                    
                    aspectLine.bindTooltip(
                        '<div style="max-width: 200px; font-size: 0.85em;">' +
                        '<strong style="color: ' + planet.color + ';">' + planet.symbol + ' ' + planet.name + ' Square</strong><br>' +
                        '90° aspectary line to ' + lineType +
                        '</div>',
                        { permanent: false, direction: 'auto', className: 'custom-tooltip' }
                    );
                    
                    currentLines.push(aspectLine);
                }
                
                if (aspectPoints && Array.isArray(aspectPoints)) {
                    if (aspectPoints.length > 0 && Array.isArray(aspectPoints[0])) {
                        // Multiple polylines (MC case) - aspectPoints is array of arrays
                        console.log('Drawing multiple aspectary lines for', planet.name, lineType);
                        for (var a = 0; a < aspectPoints.length; a++) {
                            drawAspectPolyline(aspectPoints[a], planet, lineType);
                        }
                    } else if (aspectPoints.length > 0 && !Array.isArray(aspectPoints[0])) {
                        // Single polyline (AC case) - aspectPoints is array of [lat, lon] pairs
                        console.log('Drawing single aspectary line for', planet.name, lineType);
                        drawAspectPolyline(aspectPoints, planet, lineType);
                    }
                }
            }
            */

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

    // Add planetary position markers (where each planet is overhead at birth time)
    console.log('Adding planetary position markers...');
    var gmst = getSiderealTime(jd, 0); // Define gmst for planetary position calculations
    
    for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        var planetPos = getPlanetPosition(planet.name, jd);
        
        // Calculate where planet is at zenith (directly overhead)
        // Longitude = RA - GMST, Latitude = Declination
        var planetLon = normalize180(planetPos.ra - gmst);
        var planetLat = planetPos.dec;
        
        console.log(planet.name + ' overhead at:', planetLat.toFixed(2) + '°, ' + planetLon.toFixed(2) + '°');
        
        // Only show if within reasonable bounds
        if (Math.abs(planetLat) <= 80) {
            // Simpler, more visible icon
            var planetLocationIcon = L.divIcon({
                html: '<div style="background: ' + planet.color + '; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">' + planet.symbol + '</div>',
                className: 'planet-position-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            var planetMarker = L.marker([planetLat, planetLon], {
                icon: planetLocationIcon,
                zIndexOffset: 1500
            }).addTo(map);
            
            var planetTooltipContent = '<div style="text-align: center; font-size: 0.9em;">' +
                '<strong style="color: ' + planet.color + ';">' + planet.symbol + ' ' + planet.name + '</strong><br>' +
                'Overhead Position<br>' +
                '<small>' + planetLat.toFixed(2) + '°, ' + planetLon.toFixed(2) + '°</small><br>' +
                '<small>RA: ' + planetPos.ra.toFixed(2) + '° | Dec: ' + planetPos.dec.toFixed(2) + '°</small>' +
                '</div>';
            
            planetMarker.bindTooltip(planetTooltipContent, {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip'
            });
            
            currentLines.push(planetMarker);
            console.log('Added marker for', planet.name, 'at', planetLat, planetLon);
        } else {
            console.log(planet.name + ' is outside visible bounds (lat=' + planetLat.toFixed(2) + ')');
        }
    }

    document.getElementById('legend').style.display = 'block';
    document.getElementById('infoBox').style.display = 'block';
}

function getTimezone(lat, lon) {
    // Check if timezone is locked
    var lockTimezone = document.getElementById('lockTimezone');
    if (lockTimezone && lockTimezone.checked) {
        console.log('Timezone locked, skipping auto-detection');
        return;
    }
    
    // Use TimeZoneDB or similar service for timezone detection
    // For now, use a simple approximation based on longitude
    var roughTzOffset = Math.round(lon / 15);
    
    // Regional overrides for better accuracy
    var location = document.getElementById('birthLocation').value.toLowerCase();
    
    // Note: For accurate comparison with Astro-Seek, manually set timezone and lock it
    // rather than relying on automatic detection which may differ
    
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

// Regenerate map when coordinate system changes
document.getElementById('coordinateSystem').addEventListener('change', function() {
    console.log('Coordinate system changed to:', this.value);
    // Only regenerate if we have valid coordinates
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    if (!isNaN(lat) && !isNaN(lon)) {
        generateMap();
    }
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
        // Note: geocoding is now handled by the interactive geocoder input
    }
});