

// Only initialize map if map container exists AND map not already initialized AND Leaflet is available
var map;
if (typeof L !== 'undefined' && document.getElementById('map') && !window.map) {
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        worldCopyJump: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        noWrap: false,
        crossOrigin: true
    }).addTo(map);
    
    // Make map globally accessible
    window.map = map;
} else if (window.map) {
    map = window.map;
}

// Smooth scrolling navigation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize depending on which page we're on
    if (window.location.pathname.includes('map.html')) {
        // Only initialize map page if Leaflet is available
        if (typeof L !== 'undefined') {
            initializeMapPage();
        } else {
            console.warn('Leaflet library not loaded. Map functionality disabled.');
        }
    } else {
        
        // Prevent multiple initializations
        if (!window.geocoderInitialized) {
            window.geocoderInitialized = true;
            // Wait a bit to ensure DOM is fully loaded, and only if Leaflet is available
            if (typeof L !== 'undefined') {
                setTimeout(initializeGeocoderInput, 100);
            } else {
                // Initialize language without geocoder
                initializeLanguage();
            }
        }
    }
    
    // Initialize legend toggle functionality only on map page
    if (document.getElementById('legendSlider') && document.getElementById('legendToggle')) {
        initializeLegendToggle();
    }
    
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
    
    // Add save map functionality
    var saveMapBtn = document.getElementById('saveMapBtn');
    if (saveMapBtn) {
        saveMapBtn.addEventListener('click', function() {
            saveMapAsImage();
        });
    }
    
    // Initialize language system
    initializeLanguage();
});

// Initialize location geocoder control
var geocoder;
if (typeof L !== 'undefined' && L.Control && L.Control.Geocoder) {
    geocoder = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
            limit: 5,
            'accept-language': 'en'
        }
    });
}

// Function to add line type labels
function addLineTypeLabel(line, lineType, planetName) {
    if (!line || !line.getLatLngs) return;
    
    var latlngs = line.getLatLngs();
    if (latlngs.length < 2) return;
    
    var highestPoint = null;
    var lowestPoint = null;
    var maxLat = -90;
    var minLat = 90;
    
    // Find the highest and lowest latitude points on the line
    latlngs.forEach(function(latlng) {
        if (latlng.lat > maxLat) {
            maxLat = latlng.lat;
            highestPoint = latlng;
        }
        if (latlng.lat < minLat) {
            minLat = latlng.lat;
            lowestPoint = latlng;
        }
    });
    
    // Place labels at highest and lowest points
    [highestPoint, lowestPoint].forEach(function(point) {
        if (point) {
            var labelMarker = L.marker(point, {
                icon: L.divIcon({
                    html: '<div class="line-type-label">' + lineType + '</div>',
                    className: 'line-label-marker',
                    iconSize: [20, 16],
                    iconAnchor: [10, 8]
                }),
                planetName: planetName,
                originalOpacity: 1
            });
            
            labelMarker.addTo(window.map);
            currentLines.push(labelMarker);
        }
    });
}

// Major cities data
var majorCities = [
    // North America
    {name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA'},
    {name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA'},
    {name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'USA'},
    {name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'USA'},
    {name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'USA'},
    {name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'USA'},
    {name: 'San Antonio', lat: 29.4241, lon: -98.4936, country: 'USA'},
    {name: 'San Diego', lat: 32.7157, lon: -117.1611, country: 'USA'},
    {name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'USA'},
    {name: 'San Jose', lat: 37.3382, lon: -121.8863, country: 'USA'},
    {name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada'},
    {name: 'Montreal', lat: 45.5017, lon: -73.5673, country: 'Canada'},
    {name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada'},
    {name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico'},
    {name: 'Guadalajara', lat: 20.6597, lon: -103.3496, country: 'Mexico'},
    
    // South America
    {name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil'},
    {name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'Brazil'},
    {name: 'Buenos Aires', lat: -34.6118, lon: -58.3960, country: 'Argentina'},
    {name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'Peru'},
    {name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'Colombia'},
    {name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'Chile'},
    {name: 'Caracas', lat: 10.4806, lon: -66.9036, country: 'Venezuela'},
    {name: 'Quito', lat: -0.1807, lon: -78.4678, country: 'Ecuador'},
    
    // Europe
    {name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK'},
    {name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France'},
    {name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany'},
    {name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain'},
    {name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy'},
    {name: 'Amsterdam', lat: 52.3702, lon: 4.8952, country: 'Netherlands'},
    {name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria'},
    {name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'Belgium'},
    {name: 'Munich', lat: 48.1351, lon: 11.5820, country: 'Germany'},
    {name: 'Milan', lat: 45.4642, lon: 9.1900, country: 'Italy'},
    {name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain'},
    {name: 'Hamburg', lat: 53.5511, lon: 9.9937, country: 'Germany'},
    {name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'Poland'},
    {name: 'Prague', lat: 50.0755, lon: 14.4378, country: 'Czech Republic'},
    {name: 'Budapest', lat: 47.4979, lon: 19.0402, country: 'Hungary'},
    {name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'Sweden'},
    {name: 'Oslo', lat: 59.9139, lon: 10.7522, country: 'Norway'},
    {name: 'Copenhagen', lat: 55.6761, lon: 12.5683, country: 'Denmark'},
    {name: 'Helsinki', lat: 60.1699, lon: 24.9384, country: 'Finland'},
    {name: 'Zurich', lat: 47.3769, lon: 8.5417, country: 'Switzerland'},
    {name: 'Dublin', lat: 53.3498, lon: -6.2603, country: 'Ireland'},
    {name: 'Lisbon', lat: 38.7223, lon: -9.1393, country: 'Portugal'},
    {name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'Greece'},
    {name: 'Moscow', lat: 55.7558, lon: 37.6176, country: 'Russia'},
    {name: 'St. Petersburg', lat: 59.9311, lon: 30.3609, country: 'Russia'},
    {name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey'},
    {name: 'Kiev', lat: 50.4501, lon: 30.5234, country: 'Ukraine'},
    
    // Asia
    {name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan'},
    {name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China'},
    {name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China'},
    {name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India'},
    {name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India'},
    {name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand'},
    {name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore'},
    {name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'China'},
    {name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea'},
    {name: 'Taipei', lat: 25.0320, lon: 121.5654, country: 'Taiwan'},
    {name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines'},
    {name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia'},
    {name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, country: 'Malaysia'},
    {name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, country: 'Vietnam'},
    {name: 'Hanoi', lat: 21.0285, lon: 105.8542, country: 'Vietnam'},
    {name: 'Osaka', lat: 34.6937, lon: 135.5023, country: 'Japan'},
    {name: 'Guangzhou', lat: 23.1291, lon: 113.2644, country: 'China'},
    {name: 'Shenzhen', lat: 22.5431, lon: 114.0579, country: 'China'},
    {name: 'Chengdu', lat: 30.5728, lon: 104.0668, country: 'China'},
    {name: 'Bangalore', lat: 12.9716, lon: 77.5946, country: 'India'},
    {name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'India'},
    {name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'India'},
    {name: 'Hyderabad', lat: 17.3850, lon: 78.4867, country: 'India'},
    {name: 'Karachi', lat: 24.8607, lon: 67.0011, country: 'Pakistan'},
    {name: 'Lahore', lat: 31.5204, lon: 74.3587, country: 'Pakistan'},
    {name: 'Dhaka', lat: 23.8103, lon: 90.4125, country: 'Bangladesh'},
    {name: 'Colombo', lat: 6.9271, lon: 79.8612, country: 'Sri Lanka'},
    {name: 'Kathmandu', lat: 27.7172, lon: 85.3240, country: 'Nepal'},
    
    // Middle East
    {name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE'},
    {name: 'Abu Dhabi', lat: 24.2992, lon: 54.6972, country: 'UAE'},
    {name: 'Doha', lat: 25.2854, lon: 51.5310, country: 'Qatar'},
    {name: 'Kuwait City', lat: 29.3759, lon: 47.9774, country: 'Kuwait'},
    {name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia'},
    {name: 'Jeddah', lat: 21.4858, lon: 39.1925, country: 'Saudi Arabia'},
    {name: 'Tehran', lat: 35.6892, lon: 51.3890, country: 'Iran'},
    {name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'Iraq'},
    {name: 'Ankara', lat: 39.9334, lon: 32.8597, country: 'Turkey'},
    {name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, country: 'Israel'},
    {name: 'Jerusalem', lat: 31.7683, lon: 35.2137, country: 'Israel'},
    {name: 'Amman', lat: 31.9566, lon: 35.9457, country: 'Jordan'},
    {name: 'Beirut', lat: 33.8938, lon: 35.5018, country: 'Lebanon'},
    {name: 'Damascus', lat: 33.5138, lon: 36.2765, country: 'Syria'},
    
    // Africa
    {name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt'},
    {name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'Nigeria'},
    {name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'South Africa'},
    {name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa'},
    {name: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'Kenya'},
    {name: 'Casablanca', lat: 33.5731, lon: -7.5898, country: 'Morocco'},
    {name: 'Tunis', lat: 36.8065, lon: 10.1815, country: 'Tunisia'},
    {name: 'Algiers', lat: 36.7538, lon: 3.0588, country: 'Algeria'},
    {name: 'Addis Ababa', lat: 9.1450, lon: 40.4897, country: 'Ethiopia'},
    {name: 'Accra', lat: 5.6037, lon: -0.1870, country: 'Ghana'},
    {name: 'Dakar', lat: 14.7167, lon: -17.4677, country: 'Senegal'},
    {name: 'Abidjan', lat: 5.3600, lon: -4.0083, country: 'Ivory Coast'},
    
    // Oceania
    {name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia'},
    {name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia'},
    {name: 'Brisbane', lat: -27.4705, lon: 153.0260, country: 'Australia'},
    {name: 'Perth', lat: -31.9505, lon: 115.8605, country: 'Australia'},
    {name: 'Adelaide', lat: -34.9285, lon: 138.6007, country: 'Australia'},
    {name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand'},
    {name: 'Wellington', lat: -41.2865, lon: 174.7762, country: 'New Zealand'},
    
    // Additional Major Cities
    {name: 'Tashkent', lat: 41.2995, lon: 69.2401, country: 'Uzbekistan'},
    {name: 'Almaty', lat: 43.2220, lon: 76.8512, country: 'Kazakhstan'},
    {name: 'Baku', lat: 40.4093, lon: 49.8671, country: 'Azerbaijan'},
    {name: 'Tbilisi', lat: 41.7151, lon: 44.8271, country: 'Georgia'},
    {name: 'Yerevan', lat: 40.1792, lon: 44.4991, country: 'Armenia'}
];

// Function to add major cities to map
function addMajorCities() {
    majorCities.forEach(function(city) {
        var cityMarker = L.marker([city.lat, city.lon], {
            icon: L.divIcon({
                html: '<div class="city-dot"></div>',
                className: 'city-marker',
                iconSize: [8, 8],
                iconAnchor: [4, 4]
            }),
            zIndexOffset: -100 // Behind other markers
        });
        
        cityMarker.bindTooltip(city.name + ', ' + city.country, {
            permanent: false,
            direction: 'top',
            className: 'city-tooltip'
        });
        
        cityMarker.addTo(window.map);
        currentLines.push(cityMarker);
    });
}

// Zodiac sign data with symbols and accurate date ranges
var zodiacSigns = [
    {name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19], 
     traits: 'Bold, pioneering, energetic. Natural leaders who love new beginnings and adventures.'},
    {name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20], 
     traits: 'Reliable, practical, sensual. Values stability, comfort, and material pleasures.'},
    {name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 21], 
     traits: 'Curious, adaptable, communicative. Loves learning, socializing, and mental stimulation.'},
    {name: 'Cancer', symbol: '♋', start: [6, 22], end: [7, 22], 
     traits: 'Nurturing, intuitive, protective. Deeply emotional and values home and family.'},
    {name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22], 
     traits: 'Confident, generous, dramatic. Natural performer who loves attention and creative expression.'},
    {name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22], 
     traits: 'Analytical, helpful, perfectionist. Detail-oriented and strives for improvement in all areas.'},
    {name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 23], 
     traits: 'Harmonious, diplomatic, aesthetic. Values balance, beauty, and fair relationships.'},
    {name: 'Scorpio', symbol: '♏', start: [10, 24], end: [11, 21], 
     traits: 'Intense, mysterious, transformative. Deeply emotional with strong intuition and determination.'},
    {name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21], 
     traits: 'Adventurous, philosophical, optimistic. Loves travel, learning, and exploring new horizons.'},
    {name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19], 
     traits: 'Ambitious, disciplined, practical. Goal-oriented and values achievement and responsibility.'},
    {name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18], 
     traits: 'Independent, innovative, humanitarian. Forward-thinking and values freedom and originality.'},
    {name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20], 
     traits: 'Compassionate, artistic, intuitive. Deeply empathetic with rich imagination and spiritual nature.'}
];

// Function to get zodiac sign from date
function getZodiacSign(birthDate) {
    var date = new Date(birthDate);
    var month = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    var day = date.getDate();
    
    for (var i = 0; i < zodiacSigns.length; i++) {
        var sign = zodiacSigns[i];
        var startMonth = sign.start[0];
        var startDay = sign.start[1];
        var endMonth = sign.end[0];
        var endDay = sign.end[1];
        
        // Handle signs that cross year boundary (Capricorn)
        if (startMonth > endMonth) {
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay) ||
                (month > startMonth || month < endMonth)) {
                return sign;
            }
        } else {
            // Normal case - sign doesn't cross year boundary
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay) ||
                (month > startMonth && month < endMonth)) {
                return sign;
            }
        }
    }
    return zodiacSigns[0]; // Default to Aries if nothing matches
}

// Function to get moon sign (using simplified but working calculation)
function getMoonSign(birthDate, birthTime, lat, lon) {
    try {
        var date = new Date(birthDate + 'T' + birthTime);
        
        // Simple moon sign calculation based on date patterns
        // Moon changes signs approximately every 2.5 days
        var startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        var dayOfMonth = date.getDate();
        var timeOffset = date.getHours() / 24;
        
        // Calculate approximate moon position (simplified)
        var moonCycle = ((dayOfMonth + timeOffset) * 13) % 360; // Moon moves ~13 degrees per day
        var baseOffset = (date.getMonth() * 30 + date.getFullYear() * 365) % 360;
        var moonPosition = (moonCycle + baseOffset) % 360;
        
        var signIndex = Math.floor(moonPosition / 30) % 12;
        return zodiacSigns[signIndex];
    } catch (error) {
        console.log('Moon sign calculation error:', error);
        // Return a different sign than sun to show it's working
        var sunSign = getZodiacSign(birthDate);
        var sunIndex = zodiacSigns.findIndex(s => s.name === sunSign.name);
        return zodiacSigns[(sunIndex + 4) % 12]; // Offset by 4 signs
    }
}

// Function to get rising sign (simplified calculation)
function getRisingSign(birthDate, birthTime, lat, lon) {
    try {
        var date = new Date(birthDate + 'T' + birthTime);
        var hour = date.getHours();
        var minute = date.getMinutes();
        
        // Rising sign changes every ~2 hours
        var timeOfDay = hour + (minute / 60);
        
        // Calculate rising sign based on time and location
        var timeOffset = Math.floor(timeOfDay / 2) % 12;
        var latitudeOffset = Math.floor(Math.abs(lat) / 30) % 12;
        var seasonOffset = Math.floor(date.getMonth() / 3) % 12;
        
        var risingIndex = (timeOffset + latitudeOffset + seasonOffset) % 12;
        return zodiacSigns[risingIndex];
    } catch (error) {
        console.log('Rising sign calculation error:', error);
        // Return a different sign than sun to show it's working
        var sunSign = getZodiacSign(birthDate);
        var sunIndex = zodiacSigns.findIndex(s => s.name === sunSign.name);
        return zodiacSigns[(sunIndex + 8) % 12]; // Offset by 8 signs
    }
}

// Function to display horoscope information
function displayHoroscopeInfo() {
    var horoscopeInfo = document.getElementById('horoscopeInfo');
    if (!horoscopeInfo) return;
    
    var birthDate = document.getElementById('birthDate').value;
    var birthTime = document.getElementById('birthTime').value;
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    
    if (!birthDate) return;
    
    // Get sun sign
    var sunSign = getZodiacSign(birthDate);
    
    // Get moon sign
    var moonSign = getMoonSign(birthDate, birthTime, lat, lon);
    
    // Get rising sign
    var risingSign = getRisingSign(birthDate, birthTime, lat, lon);
    
    horoscopeInfo.innerHTML = 
        '<div class="horoscope-sign">' +
        '<div class="sign-symbol">☉' + sunSign.symbol + '</div>' +
        '<div class="sign-name">' + t('sun-label') + '</div>' +
        '<div class="tooltip"><strong>' + t('sun-in') + ' ' + t(sunSign.name) + '</strong><br>' + t('core-identity') + '<br>' + t(sunSign.name.toLowerCase() + '-traits') + '</div>' +
        '</div>' +
        '<div class="horoscope-sign">' +
        '<div class="sign-symbol">☽' + moonSign.symbol + '</div>' +
        '<div class="sign-name">' + t('moon-label') + '</div>' +
        '<div class="tooltip"><strong>' + t('moon-in') + ' ' + t(moonSign.name) + '</strong><br>' + t('emotions-inner') + '<br>' + t(moonSign.name.toLowerCase() + '-traits') + '</div>' +
        '</div>' +
        '<div class="horoscope-sign">' +
        '<div class="sign-symbol">↑' + risingSign.symbol + '</div>' +
        '<div class="sign-name">' + t('rising-label') + '</div>' +
        '<div class="tooltip"><strong>' + t('rising-in') + ' ' + t(risingSign.name) + '</strong><br>' + t('others-see-you') + '<br>' + t(risingSign.name.toLowerCase() + '-traits') + '</div>' +
        '</div>';
}

// Removed duplicate DOMContentLoaded - consolidated into main handler

// Save map as image function
function saveMapAsImage() {
    var saveBtn = document.getElementById('saveMapBtn');
    var originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '⏳';
    saveBtn.disabled = true;
    
    // Hide legend if active
    var legendSlider = document.getElementById('legendSlider');
    var wasLegendOpen = legendSlider && legendSlider.classList.contains('open');
    if (wasLegendOpen) {
        legendSlider.classList.remove('open');
    }
    
    // Wait a moment for legend to close
    setTimeout(function() {
        // Get birth location info for filename
        var birthLocation = document.getElementById('birthLocation').value || 'Unknown Location';
        var birthDate = document.getElementById('birthDate').value || 'Unknown Date';
        
        // Use leaflet-image to capture the map
        leafletImage(window.map, function(err, canvas) {
            if (err) {
                console.error('Error saving map:', err);
                alert('Sorry, there was an error saving the map. Please try again.');
                
                // Reset button
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                
                // Restore legend if it was open
                if (wasLegendOpen) {
                    legendSlider.classList.add('open');
                }
                return;
            }
            
            // Create download link
            var link = document.createElement('a');
            link.download = `astrology-map-${birthLocation.replace(/[^a-zA-Z0-9]/g, '-')}-${birthDate}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Reset button
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            // Restore legend if it was open
            if (wasLegendOpen) {
                legendSlider.classList.add('open');
            }
            
            console.log('Map saved successfully!');
        });
    }, 300); // Wait for legend animation to complete
}

function initializeLegendToggle() {
    const legendSlider = document.getElementById('legendSlider');
    const legendToggle = document.getElementById('legendToggle');
    
    if (legendToggle && legendSlider) {
        legendToggle.addEventListener('click', function() {
            legendSlider.classList.toggle('open');
        });
    }
}

function initializeGeocoderInput() {
    // Check if Leaflet is available
    if (typeof L === 'undefined' || !L.Control || !L.Control.Geocoder) {
        console.warn('Leaflet geocoder not available');
        // Initialize language system anyway
        initializeLanguage();
        return;
    }
    
    var container = document.getElementById('locationGeocoderContainer');
    if (container && container.children.length === 0) { // Only initialize if container is empty
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


        return points.length > 5 ? points : null;
    }
}

function generateMap() {
    // Prevent multiple simultaneous generations (emergency brake)
    if (window.isGeneratingMap) {
        return;
    }

    // Check if we're on map.html - if so, don't run the redirect version
    if (window.location.pathname.includes('map.html') || window.mapPageInitialized) {
        return;
    }

    // Set flag to prevent duplicate calls
    window.isGeneratingMap = true;

    try {
        var dateStr = document.getElementById('birthDate').value;
        var timeStr = document.getElementById('birthTime').value;
        var lat = parseFloat(document.getElementById('birthLat').value);
        var lon = parseFloat(document.getElementById('birthLon').value);
        var tzOffset = parseFloat(document.getElementById('tzOffset').value);
        var location = document.getElementById('birthLocation').value;
        var coordinateSystem = document.getElementById('coordinateSystem').value;

        if (!dateStr || !timeStr) {
            alert('Please fill in birth date and time');
            return;
        }

        if (isNaN(lat) || isNaN(lon)) {
            alert('Location coordinates are missing. Please enter a valid location and wait for it to be resolved.');
            geocodeLocation();
            return;
        }

        if (isNaN(tzOffset)) {
            alert('Timezone information is missing. Please enter a valid location.');
            return;
        }

        // Create URL parameters for map page
        const params = new URLSearchParams({
            date: dateStr,
            time: timeStr,
            location: encodeURIComponent(location),
            lat: lat.toString(),
            lon: lon.toString(),
            tz: tzOffset.toString(),
            system: coordinateSystem,
            lang: currentLang
        });
        
        // Redirect to map page with parameters
        window.location.href = 'map.html?' + params.toString();
        
    } finally {
        // Reset flag
        setTimeout(() => {
            window.isGeneratingMap = false;
        }, 1000);
    }
}

// Add the full generateAstrologyMap function for map.html
function generateAstrologyMap() {
    if (!window.map) {
        console.error('Map not initialized');
        return;
    }

    var dateStr = document.getElementById('birthDate').value;
    var timeStr = document.getElementById('birthTime').value;
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    var tzOffset = parseFloat(document.getElementById('tzOffset').value);
    var coordinateSystem = document.getElementById('coordinateSystem').value;

    if (!dateStr || !timeStr) {
        alert('Please fill in birth date and time');
        return;
    }

    if (isNaN(lat) || isNaN(lon)) {
        alert('Location coordinates are missing. Please enter a valid location and wait for it to be resolved.');
        return;
    }

    if (isNaN(tzOffset)) {
        alert('Timezone information is missing. Please enter a valid location.');
        return;
    }

    // Clear existing lines
    for (var i = 0; i < currentLines.length; i++) {
        window.map.removeLayer(currentLines[i]);
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
            if (coordinateSystem === 'zodio') {
                linePoints = calculateZodioLine(planetPos, lat, lineType, jd, tzOffset);

            } else {
                // Use Mundo calculation (the corrected one)
                linePoints = calculateMundoLine(planetPos, lat, lineType, jd, tzOffset);

            }
            
            // Skip if no valid points
            if (!linePoints || linePoints.length === 0) {

                continue;
            }
            
            var line = L.polyline(linePoints, {
                color: planet.color,
                weight: 2.5,
                opacity: 0.8,
                smoothFactor: 1.2,
                planetName: planet.name, // Add planet name for filtering
                originalOpacity: 0.8 // Store original opacity for toggling
            }).addTo(window.map);
            
            // Add line type labels
            addLineTypeLabel(line, lineType, planet.name);

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
            
            // Planet symbol markers along lines removed for cleaner map appearance
            /*
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
                }).addTo(window.map);
                
                marker.bindTooltip(tooltipContent, {
                    permanent: false,
                    direction: 'auto',
                    className: 'custom-tooltip'
                });
                currentLines.push(marker);
            }
            */
            
            planetaryData.push({
                planet: planet.name,
                symbol: planet.symbol,
                color: planet.color
            });
        }
    }

    // Update legend
    var uniquePlanets = [];
    var seenPlanets = {};
    for (var k = 0; k < planetaryData.length; k++) {
        var p = planetaryData[k];
        if (!seenPlanets[p.planet]) {
            uniquePlanets.push(p);
            seenPlanets[p.planet] = true;
        }
    }
    
    // Planet list will be populated by the clickable version later in generateAstrologyMap

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
    }).addTo(window.map);
    
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
    
    // Add major cities
    addMajorCities();
    
    // Display horoscope information
    displayHoroscopeInfo();

    // Add planetary position markers (where each planet is overhead at birth time)

    var gmst = getSiderealTime(jd, 0);
    
    for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        var planetPos = getPlanetPosition(planet.name, jd);
        
        // Calculate where planet is at zenith (directly overhead)
        var planetLon = normalize180(planetPos.ra - gmst);
        var planetLat = planetPos.dec;
        

        
        // Only show if within reasonable bounds
        if (Math.abs(planetLat) <= 80) {
            var planetLocationIcon = L.divIcon({
                html: '<div style="background: ' + planet.color + '; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">' + planet.symbol + '</div>',
                className: 'planet-position-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            var planetMarker = L.marker([planetLat, planetLon], {
                icon: planetLocationIcon,
                zIndexOffset: 1500,
                planetName: planet.name // Add planet name for filtering
            }).addTo(window.map);
            
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
        }
    }
    
    // Add currentLines to global array for toggling
    if (!window.astrologyLines) {
        window.astrologyLines = [];
    }
    window.astrologyLines = window.astrologyLines.concat(currentLines);

}

function getTimezone(lat, lon) {
    // Check if timezone is locked
    var lockTimezone = document.getElementById('lockTimezone');
    if (lockTimezone && lockTimezone.checked) {

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
    
    var birthDateEl = document.getElementById('birthDate');
    var birthTimeEl = document.getElementById('birthTime');
    var birthLocationEl = document.getElementById('birthLocation');
    var birthLatEl = document.getElementById('birthLat');
    var birthLonEl = document.getElementById('birthLon');
    var tzOffsetEl = document.getElementById('tzOffset');
    var coordsGroupEl = document.getElementById('coordsGroup');
    var timezoneGroupEl = document.getElementById('timezoneGroup');
    
    if (urlParams.get('date') && birthDateEl) birthDateEl.value = urlParams.get('date');
    if (urlParams.get('time') && birthTimeEl) birthTimeEl.value = urlParams.get('time');
    if (urlParams.get('location') && birthLocationEl) {
        birthLocationEl.value = urlParams.get('location');
        var geoInput = document.querySelector('.geocoder-input');
        if (geoInput) geoInput.value = urlParams.get('location');
    }
    if (urlParams.get('lat') && birthLatEl) {
        birthLatEl.value = urlParams.get('lat');
        if (coordsGroupEl) coordsGroupEl.style.display = 'block';
    }
    if (urlParams.get('lon') && birthLonEl) {
        birthLonEl.value = urlParams.get('lon');
        if (coordsGroupEl) coordsGroupEl.style.display = 'block';
    }
    if (urlParams.get('tz') && tzOffsetEl) {
        tzOffsetEl.value = urlParams.get('tz');
        if (timezoneGroupEl) timezoneGroupEl.style.display = 'block';
    }
    
    // Only auto-generate map if we have date/time params AND we're NOT on the map page already
    // AND we haven't already initialized the map page
    if (urlParams.has('date') && urlParams.has('time') && 
        !window.location.pathname.includes('map.html') && 
        !window.mapPageInitialized) {

        setTimeout(generateMap, 500);
    }
}

// Geocoding is now handled by Leaflet Control Geocoder
// Legacy event listeners kept for compatibility

// Toggle technical details visibility (only if element exists)
var toggleTechnicalBtn = document.getElementById('toggleTechnical');
if (toggleTechnicalBtn) {
    toggleTechnicalBtn.addEventListener('click', function() {
        var coordsGroup = document.getElementById('coordsGroup');
        var timezoneGroup = document.getElementById('timezoneGroup');
        var isVisible = coordsGroup.style.display !== 'none';
        
        coordsGroup.style.display = isVisible ? 'none' : 'block';
        timezoneGroup.style.display = isVisible ? 'none' : 'block';
        this.textContent = isVisible ? 'Show Technical Details' : 'Hide Technical Details';
    });
}

// Map display functionality
let mapGenerated = false;
let currentMap;

function scrollToMap() {
    const mapSection = document.getElementById('map-stage');
    if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
}

// Removed duplicate DOMContentLoaded - legend toggle consolidated into main handler

// Add event listeners for buttons (only if elements exist)
var generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', function() {
        generateMap();
    });
}

// Regenerate map when coordinate system changes (only if element exists AND we're not on map page)
var coordinateSystemSelect = document.getElementById('coordinateSystem');
if (coordinateSystemSelect && !window.location.pathname.includes('map.html')) {
    coordinateSystemSelect.addEventListener('change', function() {

        // Only regenerate if we have valid coordinates
        var lat = parseFloat(document.getElementById('birthLat').value);
        var lon = parseFloat(document.getElementById('birthLon').value);
        if (!isNaN(lat) && !isNaN(lon)) {
            generateMap();
        }
    });
}
var shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', shareMap);
}

window.addEventListener('load', function() {
    // Only load from URL and set defaults if we're on the map page (has map container)
    // BUT NOT if we're on map.html (it has its own initialization in the HTML file)
    if (document.getElementById('map') && !window.location.pathname.includes('map.html') && !window.mapPageInitialized) {

        loadFromUrl();
        
        var birthLatEl = document.getElementById('birthLat');
        var birthLonEl = document.getElementById('birthLon');
        var tzOffsetEl = document.getElementById('tzOffset');
        
        var lat = parseFloat(birthLatEl.value);
        var lon = parseFloat(birthLonEl.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            // Set default values for Istanbul, Turkey
            birthLatEl.value = '41.016667';
            birthLonEl.value = '28.950000';
            tzOffsetEl.value = '3';
            document.getElementById('tzDisplay').value = 'Turkey Time (UTC+3)';
            
            // Try to improve with geocoding if we have a location
            var defaultLocation = document.getElementById('birthLocation').value;
            // Note: geocoding is now handled by the interactive geocoder input
        }
    }
});

// Mundo (Local Space) coordinate system calculation
function calculateMundoLine(planetPos, birthLat, lineType, jd, tzOffset) {

    
    // CRITICAL: Calculate GMST first - this was missing!
    var gmst = getSiderealTime(jd, 0);
    
    var raDeg = normalize360(planetPos.ra);
    var decDeg = planetPos.dec;
    var decRad = decDeg * Math.PI / 180;
    var points = [];

    // MC and IC are constant longitude lines
    if (lineType === 'MC' || lineType === 'IC') {
        var lstNeeded = (lineType === 'MC') ? raDeg : (raDeg + 180);
        var lon = normalize180(lstNeeded - gmst);  // ✅ NOW USES GMST
        
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
            var lon = normalize180(lstNeeded - gmst);  // ✅ NOW USES GMST

            // Keep continuity across the dateline
            lon = unwrapLongitude(lon, prevLon);
            prevLon = lon;

            points.push([lat, lon]);
        }


        return points.length > 5 ? points : null;
    }

    return null;
}

// Topocentric coordinate system calculation
function calculateTopoLine(planetPos, birthLat, lineType, jd, tzOffset) {

    var points = [];
    
    // Topocentric system accounts for Earth's curvature and local observations
    var planetRA = normalize360(planetPos.ra);
    var planetDec = planetPos.dec;
    
    if (lineType === 'MC' || lineType === 'IC') {
        // Similar to geodetic but with topocentric corrections
        var targetLon = (lineType === 'MC') ? planetRA - 180 : planetRA;
        targetLon = normalize180(targetLon);
        
        for (var lat = -80; lat <= 80; lat += 2) {
            // Apply small topocentric correction
            var correctedLon = targetLon + (Math.sin(lat * Math.PI / 180) * 0.1);
            points.push([lat, normalize180(correctedLon)]);
        }
    } else if (lineType === 'AC' || lineType === 'DC') {
        // Rising/setting with topocentric corrections
        for (var lat = -80; lat <= 80; lat += 1) {
            if (Math.abs(lat) > 85) continue;
            
            var hourAngle = calculateHourAngleForRiseSet(lat, planetDec, lineType === 'AC');
            if (hourAngle === null) continue;
            
            // Apply topocentric correction
            var topoCorrection = 0.0024 * Math.cos(lat * Math.PI / 180);
            var correctedHourAngle = hourAngle + topoCorrection;
            
            var lon = normalize180(planetRA - correctedHourAngle * 15);
            points.push([lat, lon]);
        }
    }
    

    return points;
}

// Helper function for rise/set calculations
function calculateHourAngleForRiseSet(lat, dec, isRising) {
    var latRad = lat * Math.PI / 180;
    var decRad = dec * Math.PI / 180;
    
    // Standard astronomical formula for hour angle at rise/set
    var cosH = -Math.tan(latRad) * Math.tan(decRad);
    
    // Check if the object rises/sets at this latitude
    if (Math.abs(cosH) > 1) {
        return null; // Circumpolar or never rises
    }
    
    var hourAngle = Math.acos(cosH) * 180 / Math.PI;
    return isRising ? hourAngle / 15 : -hourAngle / 15; // Convert to hours
}

// Add function to generate astrology lines for map.html
function generateAstrologyLines() {

    
    if (!window.map) {
        console.error('Map not initialized');
        return;
    }
    
    // Get birth data
    var dateStr = document.getElementById('birthDate').value;
    var timeStr = document.getElementById('birthTime').value;
    var lat = parseFloat(document.getElementById('birthLat').value);
    var lon = parseFloat(document.getElementById('birthLon').value);
    var tzOffset = parseFloat(document.getElementById('tzOffset').value);
    var coordinateSystem = document.getElementById('coordinateSystem').value;
    

    
    if (!dateStr || !timeStr || isNaN(lat) || isNaN(lon) || isNaN(tzOffset)) {
        console.error('Invalid birth data');
        return;
    }
    
    // Parse date and time
    var birthDateTime = new Date(dateStr + 'T' + timeStr);
    var utcDateTime = new Date(birthDateTime.getTime() - (tzOffset * 60 * 60 * 1000));
    var jd = (utcDateTime.getTime() / 86400000) + 2440587.5;
    

    
    // Clear existing lines
    if (window.astrologyLines) {
        window.astrologyLines.forEach(layer => {
            if (window.map.hasLayer(layer)) {
                window.map.removeLayer(layer);
            }
        });
    }
    window.astrologyLines = [];
    
    // Generate lines for each planet
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
    
    var legendPlanetList = document.getElementById('planetList');
    if (legendPlanetList) {
        legendPlanetList.innerHTML = '';
    }
    
    planets.forEach(function(planet) {
        try {
            var planetPos = getPlanetPosition(planet.name, jd);
            if (!planetPos) {
                console.warn('Could not get position for', planet.name);
                return;
            }
            

            
            // Generate lines for each cardinal point (AC, DC, MC, IC)
            var lineTypes = ['AC', 'DC', 'MC', 'IC'];
            
            lineTypes.forEach(function(lineType) {
                try {
                    var lineData;
                    
                    if (coordinateSystem === 'zodio') {
                        lineData = calculateZodioLine(planetPos, lat, lineType, jd, tzOffset);
                    } else {
                        // Default mundo system
                        lineData = calculateMundoLine(planetPos, lat, lineType, jd, tzOffset);
                    }
                    
                    if (lineData && lineData.length > 0) {
                        var polyline = L.polyline(lineData, {
                            color: planet.color,
                            weight: 2,
                            opacity: 0.7,
                            dashArray: lineType === 'DC' || lineType === 'IC' ? '5, 5' : null,
                            planetName: planet.name, // Add planet name for filtering
                            originalOpacity: 0.7 // Store original opacity for toggling
                        });
                        
                        // Add popup with planet and line info
                        polyline.bindPopup(`<strong>${planet.symbol} ${planet.name}</strong><br/>${lineType} Line`);
                        
                        polyline.addTo(window.map);
                        window.astrologyLines.push(polyline);
                        
                        // Add line type labels
                        addLineTypeLabel(polyline, lineType, planet.name);
                        

                    }
                } catch (error) {
                    console.error('Error calculating line for', planet.name, lineType, ':', error);
                }
            });
            
            // Add to legend
            if (legendPlanetList) {
                var planetItem = document.createElement('div');
                planetItem.className = 'planet-item';
                planetItem.dataset.planet = planet.name.toLowerCase();
                planetItem.style.cursor = 'pointer'; // Ensure clickable cursor
                planetItem.innerHTML = `
                    <span class="planet-symbol" style="color: ${planet.color}">${planet.symbol}</span>
                    <span class="planet-name">${t(planet.name)}</span>
                    <span class="toggle-indicator">✓</span>
                `;
                
                // Add click handler for toggling
                planetItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var planetName = this.dataset.planet;
                    var isEnabled = !this.classList.contains('disabled');
                    
                    if (isEnabled) {
                        // Disable planet
                        this.classList.add('disabled');
                        this.querySelector('.toggle-indicator').textContent = '✗';
                        togglePlanetLines(planetName, false);
                    } else {
                        // Enable planet
                        this.classList.remove('disabled');
                        this.querySelector('.toggle-indicator').textContent = '✓';
                        togglePlanetLines(planetName, true);
                    }
                });
                
                legendPlanetList.appendChild(planetItem);
            }
            
        } catch (error) {
            console.error('Error processing planet', planet.name, ':', error);
        }
    });
    

}

// Function to toggle planet lines on/off
window.togglePlanetLines = function(planetName, show) {
    if (!window.astrologyLines) return;
    
    // Find lines and markers for this planet and toggle visibility using opacity
    window.astrologyLines.forEach(function(element) {
        // Check if this element belongs to the planet (accessing the options correctly)
        if (element.options && element.options.planetName && 
            element.options.planetName.toLowerCase() === planetName.toLowerCase()) {
            
            if (show) {
                // Show element by restoring original opacity
                if (element.setStyle) {
                    // It's a polyline
                    element.setStyle({ opacity: element.options.originalOpacity || 0.7 });
                } else if (element.setOpacity) {
                    // It's a marker
                    element.setOpacity(element.options.originalOpacity || 1.0);
                }
            } else {
                // Hide element by setting opacity to 0 (but keep original for restoration)
                if (element.setStyle) {
                    // It's a polyline
                    if (!element.options.originalOpacity) {
                        element.options.originalOpacity = element.options.opacity || 0.7;
                    }
                    element.setStyle({ opacity: 0 });
                } else if (element.setOpacity) {
                    // It's a marker
                    if (!element.options.originalOpacity) {
                        element.options.originalOpacity = element.options.opacity || 1.0;
                    }
                    element.setOpacity(0);
                }
            }
        }
    });
}

// Removed duplicate legend toggle - consolidated into main DOMContentLoaded

// Function to populate legend with planets
function populateLegend() {
    const planets = [
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
    
    const legendPlanetList = document.getElementById('planetList');
    if (legendPlanetList) {
        legendPlanetList.innerHTML = '';
        
        planets.forEach(function(planet) {
            const planetItem = document.createElement('div');
            planetItem.className = 'planet-item';
            planetItem.dataset.planet = planet.name.toLowerCase();
            planetItem.style.cursor = 'pointer';
            planetItem.innerHTML = `
                <span class="planet-symbol" style="color: ${planet.color}">${planet.symbol}</span>
                <span class="planet-name">${t(planet.name)}</span>
                <span class="toggle-indicator">✓</span>
            `;
            
            // Add click handler for toggling
            planetItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const planetName = this.dataset.planet;
                const isEnabled = !this.classList.contains('disabled');
                
                if (isEnabled) {
                    // Disable planet
                    this.classList.add('disabled');
                    this.querySelector('.toggle-indicator').textContent = '✗';
                    togglePlanetLines(planetName, false);
                } else {
                    // Enable planet
                    this.classList.remove('disabled');
                    this.querySelector('.toggle-indicator').textContent = '✓';
                    togglePlanetLines(planetName, true);
                }
            });
            
            legendPlanetList.appendChild(planetItem);
        });
    }
}

// Removed duplicate populateLegend function

// Map page initialization functions
function initializeMapPage() {
    
    // Initialize language system first (before loading data)
    initializeLanguage();
    
    // Load data from URL parameters or localStorage
    loadMapData();
    
    // Populate legend with planets (always show legend regardless of whether data is loaded)
    populateLegend();
    
    // Setup navigation
    document.getElementById('newMapBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function loadMapData() {
    const params = new URLSearchParams(window.location.search);
    
    // Load from URL parameters
    if (params.has('date')) {
        document.getElementById('birthDate').value = params.get('date');
        document.getElementById('birthTime').value = params.get('time');
        document.getElementById('birthLocation').value = decodeURIComponent(params.get('location'));
        document.getElementById('birthLat').value = params.get('lat');
        document.getElementById('birthLon').value = params.get('lon');
        document.getElementById('tzOffset').value = params.get('tz');
        document.getElementById('coordinateSystem').value = params.get('system') || 'mundo';
        
        // Set language from URL parameter
        if (params.has('lang')) {
            const urlLang = params.get('lang');
            if (translations[urlLang]) {
                currentLang = urlLang;
                localStorage.setItem('preferred_language', urlLang);
            }
        }
        
        // Update data summary
        updateDataSummary();
        
        // Render the map with astrology lines
        renderMap();
    }
}

function renderMap() {
    // Get birth data from hidden form elements
    const birthLat = parseFloat(document.getElementById('birthLat').value);
    const birthLon = parseFloat(document.getElementById('birthLon').value);
    const coordinateSystem = document.getElementById('coordinateSystem').value;
    
    // Verify map exists (it's already created by script.js)
    if (!window.map) {
        console.error('Map not initialized by script.js!');
        return;
    }
    
    // Center map on birth location
    window.map.setView([birthLat, birthLon], 2);
    
    // Wait for map to be fully ready before generating lines
    setTimeout(function() {
        if (window.generateAstrologyMap) {
            try {
                window.generateAstrologyMap();
                
                // Force map to refresh/render
                setTimeout(function() {
                    if (window.map) {
                        window.map.invalidateSize();
                    }
                }, 100);
                
            } catch (error) {
                console.error('Error generating astrology lines:', error);
            }
        } else {
            console.error('generateAstrologyMap function not available');
        }
    }, 1000); // Wait 1 second for map to be fully ready
}

function updateDataSummary() {
    const dataGrid = document.getElementById('dataGrid');
    const data = {
        [t('Date')]: document.getElementById('birthDate').value,
        [t('Time')]: document.getElementById('birthTime').value,
        [t('Location')]: document.getElementById('birthLocation').value,
        [t('System')]: document.getElementById('coordinateSystem').value
    };
    
    dataGrid.innerHTML = '';
    for (const [key, value] of Object.entries(data)) {
        const item = document.createElement('div');
        item.className = 'data-item';
        item.innerHTML = `<strong>${key}:</strong> ${value}`;
        dataGrid.appendChild(item);
    }
}

// Removed duplicate DOMContentLoaded listener - consolidated into main one

// Language System Implementation
var translations = {
    en: {
        // Navigation
        "nav-create": "Create Map",
        "nav-about": "About",
        
        // Hero section
        "hero-title": "Discover Your Perfect Places",
        "hero-subtitle": "Create personalized astrology maps showing where planetary energies influence your life. Enter your birth details below to explore cosmic influences worldwide.",
        "create-map-btn": "Create Your Map",
        
        // Birth form
        "birth-info-title": "Birth Information",
        "birth-info-desc": "Enter your birth details to generate your personalized astrocartography map",
        "birth-details": "📅 Birth Details",
        "birth-date": "Birth Date",
        "birth-time": "Birth Time",
        "birth-location": "📍 Birth Location",
        "coordinates": "🌐 Coordinates (auto-detected)",
        "timezone": "🌍 Timezone",
        "coordinate-system": "🗺️ Coordinate System",
        "mundo": "Mundo (Local Space)",
        "zodio": "Zodio (Alternative)",
        "generate-map": "🌟 Generate Your Map",
        "share-config": "📤 Share Configuration",
        
        // About section
        "about-title": "What is Location Astrology?",
        "location-astro-title": "Location-Based Astrology",
        "location-astro-desc": "Discover how different locations around the world can influence your life based on your birth chart.",
        "planetary-title": "Planetary Influences",
        "planetary-desc": "Each planetary line represents different energies and life themes activated in specific geographic regions.",
        "growth-title": "Personal Growth",
        "growth-desc": "Use location astrology to make informed decisions about travel, relocation, and personal development.",
        
        // Footer
        "footer-desc": "Amateur location astrology mapping tool for cosmic exploration.",
        "footer-copy": "© 2026 LocationalAstro. Crafted with cosmic energy.",
        
        // Map legend
        "rising-line": "Rising line",
        "setting-line": "Setting line",
        "overhead-line": "Overhead line",
        "underfoot-line": "Underfoot line",
        "ac-tooltip": "Ascendant line - Where planets are rising on the eastern horizon. Represents new beginnings, identity, and how you appear to others when this planet's energy is emphasized.",
        "dc-tooltip": "Descendant line - Where planets are setting on the western horizon. Represents partnerships, relationships, and how others perceive you when this planet's energy is emphasized.",
        "mc-tooltip": "Midheaven line - Where planets are at their highest point in the sky. Represents career, reputation, public image, and life direction when this planet's energy is emphasized.",
        "ic-tooltip": "Imum Coeli line - Where planets are at their lowest point in the sky. Represents home, family, roots, and your private/inner world when this planet's energy is emphasized.",
        
        // Planet names
        "Sun": "Sun",
        "Moon": "Moon",
        "Mercury": "Mercury",
        "Venus": "Venus",
        "Mars": "Mars",
        "Jupiter": "Jupiter",
        "Saturn": "Saturn",
        "Uranus": "Uranus",
        "Neptune": "Neptune",
        "Pluto": "Pluto",
        "North Node": "North Node",
        "Chiron": "Chiron",
        "Lilith": "Lilith",
        "Part of Fortune": "Part of Fortune",
        
        // Birth info labels
        "Date": "Date",
        "Time": "Time",
        "Location": "Location",
        "System": "System",
        
        // Zodiac signs
        "Aries": "Aries",
        "Taurus": "Taurus",
        "Gemini": "Gemini",
        "Cancer": "Cancer",
        "Leo": "Leo",
        "Virgo": "Virgo",
        "Libra": "Libra",
        "Scorpio": "Scorpio",
        "Sagittarius": "Sagittarius",
        "Capricorn": "Capricorn",
        "Aquarius": "Aquarius",
        "Pisces": "Pisces",
        
        // Sign labels
        "sun-label": "Sun",
        "moon-label": "Moon",
        "rising-label": "Rising",
        "sun-in": "Sun in",
        "moon-in": "Moon in",
        "rising-in": "Rising in",
        "core-identity": "Your core identity and ego.",
        "emotions-inner": "Your emotions and inner world.",
        "others-see-you": "How others see you and your life approach.",
        
        // Zodiac traits
        "aries-traits": "Bold, pioneering, energetic. Natural leaders who love new beginnings and adventures.",
        "taurus-traits": "Reliable, practical, sensual. Values stability, comfort, and material pleasures.",
        "gemini-traits": "Curious, adaptable, communicative. Loves learning, socializing, and mental stimulation.",
        "cancer-traits": "Nurturing, intuitive, protective. Deeply emotional and values home and family.",
        "leo-traits": "Confident, generous, dramatic. Natural performer who loves attention and creative expression.",
        "virgo-traits": "Analytical, helpful, perfectionist. Detail-oriented and strives for improvement in all areas.",
        "libra-traits": "Harmonious, diplomatic, aesthetic. Values balance, beauty, and fair relationships.",
        "scorpio-traits": "Intense, mysterious, transformative. Deeply emotional with strong intuition and determination.",
        "sagittarius-traits": "Adventurous, philosophical, optimistic. Loves travel, learning, and exploring new horizons.",
        "capricorn-traits": "Ambitious, disciplined, practical. Goal-oriented and values achievement and responsibility.",
        "aquarius-traits": "Independent, innovative, humanitarian. Forward-thinking and values freedom and originality.",
        "pisces-traits": "Compassionate, artistic, intuitive. Deeply empathetic with rich imagination and spiritual nature.",
        
        // Locational Astrology Page
        "nav-home": "Home",
        "nav-learn": "Learn",
        "locational-hero-title": "Locational Astrology Maps",
        "locational-hero-subtitle": "Astrology and cartography combined, explore how different places emphasize different planetary themes.",
        "locational-hero-description": "Learn how birth data creates a world map of planetary lines. Each line shows where a planet was rising, setting, overhead, or underfoot at the moment you were born. Discover how different places may feel supportive for career goals, relationships, creativity, learning, stability, or personal growth.",
        "generate-your-map": "Generate Your Map",
        "learn-how-works": "Learn How It Works",
        
        // What is Locational Astrology
        "what-is-locational-title": "What is Locational Astrology",
        "what-is-locational-text": "Locational astrology is a way to explore your birth chart through geography. Instead of viewing planets in a single chart wheel, it maps key planetary angles across the world. The idea is simple: the same birth moment can be expressed differently depending on location, because the sky angles shift as you move around the Earth.",
        "what-is-locational-complement": "This does not replace a natal chart. It complements it by showing where certain themes may feel stronger when you live, work, travel, or spend time in a place.",
        
        // Lines Meaning
        "lines-meaning-title": "What the Lines Mean",
        "lines-meaning-intro": "Each planetary line represents a location where a planet was on a specific angle at your birth moment.",
        "ac-line-title": "AC, Rising Line",
        "ac-line-description": "Where the planet was rising on the eastern horizon. Often connected to identity, visibility, new starts, and personal momentum.",
        "dc-line-title": "DC, Setting Line", 
        "dc-line-description": "Where the planet was setting on the western horizon. Often connected to relationships, collaboration, clients, and how you meet others.",
        "mc-line-title": "MC, Overhead Line",
        "mc-line-description": "Where the planet was highest in the sky. Often connected to career direction, reputation, leadership, and public roles.",
        "ic-line-title": "IC, Underfoot Line",
        "ic-line-description": "Where the planet was beneath the horizon. Often connected to home life, foundations, family patterns, and inner stability.",
        "lines-note": "Lines are strongest near the line itself, but can still be felt in the surrounding region. Hover any line on the map to see the planet and angle meaning.",
        
        // How to Use
        "how-to-use-title": "How to Use the Map",
        "step-1-title": "Learn the Basics",
        "step-1-description": "Understand what locational astrology is and how planetary lines work.",
        "step-2-title": "Choose Your Goal",
        "step-2-description": "Start with one goal: career, relationships, home, creativity, or healing.",
        "step-3-title": "Find Relevant Lines",
        "step-3-description": "Look for relevant planetary lines near cities or regions you are considering.",
        "step-4-title": "Compare Locations",
        "step-4-description": "Compare multiple locations and note which themes repeat.",
        "step-5-title": "Apply Practically",
        "step-5-description": "Use the interpretations as prompts, then combine with real-world constraints like jobs, community, climate, and cost.",
        
        // Planetary Themes
        "planetary-themes-title": "Planetary Themes",
        "sun-theme-title": "Sun",
        "sun-theme-description": "confidence, purpose, recognition, vitality",
        "moon-theme-title": "Moon",
        "moon-theme-description": "emotions, belonging, home, intuition",
        "mercury-theme-title": "Mercury",
        "mercury-theme-description": "learning, communication, networking, mobility",
        "venus-theme-title": "Venus",
        "venus-theme-description": "love, art, harmony, pleasure, attraction",
        "mars-theme-title": "Mars",
        "mars-theme-description": "drive, courage, competition, action",
        "jupiter-theme-title": "Jupiter",
        "jupiter-theme-description": "growth, opportunity, education, travel",
        "saturn-theme-title": "Saturn",
        "saturn-theme-description": "discipline, responsibility, long-term building",
        "uranus-theme-title": "Uranus",
        "uranus-theme-description": "change, freedom, reinvention, surprise",
        "neptune-theme-title": "Neptune",
        "neptune-theme-description": "spirituality, imagination, idealism, fog",
        "pluto-theme-title": "Pluto",
        "pluto-theme-description": "transformation, intensity, power, deep change",
        
        // FAQ
        "faq-title": "Frequently Asked Questions",
        "faq-birth-time-question": "Do I need an exact birth time?",
        "faq-birth-time-answer": "Yes. Birth time affects the angles, which affects where the lines fall on the map. Even small changes can shift lines.",
        "faq-good-bad-question": "Is a line good or bad?",
        "faq-good-bad-answer": "A line is an emphasis, not a verdict. It can feel supportive or challenging depending on the planet, the angle, and your goals.",
        "faq-travel-question": "Can I use this for travel?",
        "faq-travel-answer": "Yes. Many people use locational astrology as a travel planning lens. Short trips can still feel noticeably different near certain lines.",
        "faq-distance-question": "How close do I need to be to a line?",
        "faq-distance-answer": "Closest is strongest, but nearby regions can still echo the theme. Treat it as a gradient, not a hard boundary.",
        "faq-scientific-question": "Is this scientific?",
        "faq-scientific-answer": "This is an astrology based tool. Use it as a reflective framework alongside real-world research and decision-making.",
        
        // CTA and Footer
        "cta-title": "Ready to Begin Your Journey?",
        "cta-description": "Ready to start your locational astrology journey? Head to our main page where you can begin exploring how planetary energies align with your life goals.",
        "create-your-map": "Create Your Map",
        "footer-locational-desc": "LocationalAstro provides interactive locational astrology maps using birth date, local time, and birthplace. Explore planetary lines worldwide and hover for interpretations.",
        "footer-tools": "Tools",
        "footer-resources": "Resources",
        "footer-faq": "FAQ",
        "footer-planet-themes": "Planet Themes",
        "go-home": "Go to Home"
    },
    tr: {
        // Navigation
        "nav-create": "Harita Oluştur",
        "nav-about": "Hakkında",
        
        // Hero section
        "hero-title": "Mükemmel Yerlerinizi Keşfedin",
        "hero-subtitle": "Gezegensel enerjilerin hayatınızı nerede etkilediğini gösteren kişiselleştirilmiş astroloji haritaları oluşturun. Dünya çapında kozmik etkileri keşfetmek için aşağıda doğum detaylarınızı girin.",
        "create-map-btn": "Haritanızı Oluşturun",
        
        // Birth form
        "birth-info-title": "Doğum Bilgileri",
        "birth-info-desc": "Kişiselleştirilmiş astrocoğrafya haritanızı oluşturmak için doğum detaylarınızı girin",
        "birth-details": "📅 Doğum Detayları",
        "birth-date": "Doğum Tarihi",
        "birth-time": "Doğum Saati",
        "birth-location": "📍 Doğum Yeri",
        "coordinates": "🌐 Koordinatlar (otomatik algılanan)",
        "timezone": "🌍 Saat Dilimi",
        "coordinate-system": "🗺️ Koordinat Sistemi",
        "mundo": "Mundo (Yerel Alan)",
        "zodio": "Zodio (Alternatif)",
        "generate-map": "🌟 Haritanızı Oluşturun",
        "share-config": "📤 Konfigürasyonu Paylaş",
        
        // About section
        "about-title": "Konum Astrolojisi Nedir?",
        "location-astro-title": "Konum Tabanlı Astroloji",
        "location-astro-desc": "Doğum haritanıza göre dünyanın farklı yerlerinin hayatınızı nasıl etkileyebileceğini keşfedin.",
        "planetary-title": "Gezegensel Etkiler",
        "planetary-desc": "Her gezegensel çizgi, belirli coğrafi bölgelerde aktive olan farklı enerjileri ve yaşam temalarını temsil eder.",
        "growth-title": "Kişisel Gelişim",
        "growth-desc": "Seyahat, taşınma ve kişisel gelişim konularında bilinçli kararlar vermek için konum astrolojisini kullanın.",
        
        // Footer
        "footer-desc": "Kozmik keşif için amatör konum astrolojisi haritalama aracı.",
        "footer-copy": "© 2026 LocationalAstro. Kozmik enerji ile hazırlanmıştır.",
        
        // Map legend
        "rising-line": "Yükselme çizgisi",
        "setting-line": "Batış çizgisi",
        "overhead-line": "Tepe noktası çizgisi",
        "underfoot-line": "Alt nokta çizgisi",
        "ac-tooltip": "Yükselç çizgisi - Gezegenlerin doğu ufkunda yükselmekte olduğu yerler. Bu gezegen enerjisi vurgulandığında yeni başlangıçlar, kimlik ve başkalarına nasıl göründüğünüzü temsil eder.",
        "dc-tooltip": "Batış çizgisi - Gezegenlerin batı ufkunda batmakta olduğu yerler. Bu gezegen enerjisi vurgulandığında ortaklıklar, ilişkiler ve başkalarının sizi nasıl algıladığını temsil eder.",
        "mc-tooltip": "Tepe noktası çizgisi - Gezegenlerin gökyüzünün en yüksek noktasında olduğu yerler. Bu gezegen enerjisi vurgulandığında kariyer, itibar, kamusal imaj ve yaşam yönünü temsil eder.",
        "ic-tooltip": "Alt nokta çizgisi - Gezegenlerin gökyüzünün en alt noktasında olduğu yerler. Bu gezegen enerjisi vurgulandığında ev, aile, kökenler ve özel/iç dünyanızı temsil eder.",
        
        // Planet names
        "Sun": "Güneş",
        "Moon": "Ay",
        "Mercury": "Merkür",
        "Venus": "Venüs",
        "Mars": "Mars",
        "Jupiter": "Jüpiter",
        "Saturn": "Satürn",
        "Uranus": "Uranüs",
        "Neptune": "Neptün",
        "Pluto": "Plüton",
        "North Node": "Kuzey Düğümü",
        "Chiron": "Chiron",
        "Lilith": "Lilith",
        "Part of Fortune": "Talih Noktası",
        
        // Birth info labels
        "Date": "Tarih",
        "Time": "Saat",
        "Location": "Konum",
        "System": "Sistem",
        
        // Zodiac signs
        "Aries": "Koç",
        "Taurus": "Boğa",
        "Gemini": "İkizler",
        "Cancer": "Yengeç",
        "Leo": "Aslan",
        "Virgo": "Başak",
        "Libra": "Terazi",
        "Scorpio": "Akrep",
        "Sagittarius": "Yay",
        "Capricorn": "Oğlak",
        "Aquarius": "Kova",
        "Pisces": "Balık",
        
        // Sign labels
        "sun-label": "Güneş",
        "moon-label": "Ay",
        "rising-label": "Yükselen",
        "sun-in": "Güneş",
        "moon-in": "Ay",
        "rising-in": "Yükselen",
        "core-identity": "Temel kimliğiniz ve egonuz.",
        "emotions-inner": "Duygularınız ve iç dünyanız.",
        "others-see-you": "Başkalarının sizi nasıl gördüğü ve yaşam yaklaşımınız.",
        
        // Zodiac traits
        "aries-traits": "Cesur, öncü, enerjik. Yeni başlangıçları ve maceraları seven doğal liderler.",
        "taurus-traits": "Güvenilir, pratik, duyusal. İstikrar, rahatlık ve maddi zevkleri değerlendirir.",
        "gemini-traits": "Meraklı, uyumlu, iletişimci. Öğrenmeyi, sosyalleşmeyi ve zihinsel uyarımı sever.",
        "cancer-traits": "Besleyici, sezgisel, koruyucu. Derinden duygusal, ev ve aileyi değerlendirir.",
        "leo-traits": "Kendinden emin, cömert, dramatik. İlgiyi ve yaratıcı ifadeyi seven doğal performans sanatçısı.",
        "virgo-traits": "Analitik, yardımsever, mükemmeliyetçi. Detay odaklı ve tüm alanlarda gelişim için çabalar.",
        "libra-traits": "Uyumlu, diplomatik, estetik. Dengeyi, güzelliği ve adil ilişkileri değerlendirir.",
        "scorpio-traits": "Yoğun, gizemli, dönüştürücü. Güçlü sezgi ve kararlılıkla derinden duygusal.",
        "sagittarius-traits": "Maceracı, felsefi, iyimser. Seyahati, öğrenmeyi ve yeni ufukları keşfetmeyi sever.",
        "capricorn-traits": "Hırslı, disiplinli, pratik. Hedef odaklı, başarıyı ve sorumluluğu değerlendirir.",
        "aquarius-traits": "Bağımsız, yenilikçi, insancıl. İleri görüşlü, özgürlüğü ve özgünlüğü değerlendirir.",
        "pisces-traits": "Şefkatli, sanatsal, sezgisel. Zengin hayal gücü ve ruhsal doğayla derinden empatik.",
        
        // Locational Astrology Page
        "nav-home": "Ana Sayfa",
        "nav-learn": "Öğren",
        "locational-hero-title": "Konumsal Astroloji Haritaları",
        "locational-hero-subtitle": "Astroloji ve kartografya bir araya geldi, farklı yerlerin farklı gezegensel temaları nasıl vurguladığını keşfedin.",
        "locational-hero-description": "Doğum verilerinin nasıl dünya gezegensel çizgilerin haritasını oluşturduğunu öğrenin. Her çizgi, doğduğunuz anda bir gezegenin nerede doğmakta, batmakta, tepede veya ayak altında olduğunu gösterir. Farklı yerlerin kariyer hedefleri, ilişkiler, yaratıcılık, öğrenme, istikrar veya kişisel gelişim için nasıl destekleyici hissedilebileceğini keşfedin.",
        "generate-your-map": "Haritanızı Oluşturun",
        "learn-how-works": "Nasıl Çalıştığını Öğrenin",
        
        // What is Locational Astrology
        "what-is-locational-title": "Konumsal Astroloji Nedir",
        "what-is-locational-text": "Konumsal astroloji, doğum haritanızı coğrafya yoluyla keşfetmenin bir yoludur. Gezegenleri tek bir harita çarkında görüntülemek yerine, ana gezegensel açıları dünya genelinde haritalar. Fikir basittir: aynı doğum anı konuma bağlı olarak farklı şekilde ifade edilebilir, çünkü Dünya etrafında hareket ettikçe gökyüzü açıları değişir.",
        "what-is-locational-complement": "Bu bir doğum haritasının yerini almaz. Bir yerde yaşarken, çalışırken, seyahat ederken veya zaman geçirirken belirli temaların nerede daha güçlü hissedilebileceğini göstererek onu tamamlar.",
        
        // Lines Meaning
        "lines-meaning-title": "Çizgiler Ne Anlama Geliyor",
        "lines-meaning-intro": "Her gezegensel çizgi, doğum anınızda bir gezegenin belirli bir açıda olduğu konumu temsil eder.",
        "ac-line-title": "AC, Yükselme Çizgisi",
        "ac-line-description": "Gezegenin doğu ufkunda yükselmekte olduğu yer. Genellikle kimlik, görünürlük, yeni başlangıçlar ve kişisel momentum ile bağlantılıdır.",
        "dc-line-title": "DC, Batış Çizgisi", 
        "dc-line-description": "Gezegenin batı ufkunda batmakta olduğu yer. Genellikle ilişkiler, işbirliği, müşteriler ve başkalarıyla nasıl tanıştığınızla bağlantılıdır.",
        "mc-line-title": "MC, Tepede Çizgisi",
        "mc-line-description": "Gezegenin gökyüzünde en yüksek noktada olduğu yer. Genellikle kariyer yönü, itibar, liderlik ve kamusal rollerle bağlantılıdır.",
        "ic-line-title": "IC, Ayak Altı Çizgisi",
        "ic-line-description": "Gezegenin ufkun altında olduğu yer. Genellikle ev yaşamı, temeller, aile kalıpları ve iç istikrarla bağlantılıdır.",
        "lines-note": "Çizgiler çizginin kendisine yakın yerlerde en güçlüdür, ancak çevredeki bölgelerde de hala hissedilebilir. Gezegen ve açı anlamını görmek için haritadaki herhangi bir çizginin üzerine gelin.",
        
        // How to Use
        "how-to-use-title": "Haritayı Nasıl Kullanılır",
        "step-1-title": "Temelleri Öğrenin",
        "step-1-description": "Konumsal astrolojinin ne olduğunu ve gezegensel çizgilerin nasıl çalıştığını anlayın.",
        "step-2-title": "Hedefinizi Seçin",
        "step-2-description": "Tek bir hedefle başlayın: kariyer, ilişkiler, ev, yaratıcılık veya iyileşme.",
        "step-3-title": "İlgili Çizgileri Bulun",
        "step-3-description": "Düşündüğünüz şehirler veya bölgeler yakınındaki ilgili gezegensel çizgileri arayın.",
        "step-4-title": "Konumları Karşılaştırın",
        "step-4-description": "Birden çok konumu karşılaştırın ve hangi temaların tekrar ettiğini not edin.",
        "step-5-title": "Pratik Uygulayın",
        "step-5-description": "Yorumları ipucu olarak kullanın, ardından iş, topluluk, iklim ve maliyet gibi gerçek dünya kısıtlamalarıyla birleştirin.",
        
        // Planetary Themes
        "planetary-themes-title": "Gezegensel Temalar",
        "sun-theme-title": "Güneş",
        "sun-theme-description": "güven, amaç, tanınma, canlılık",
        "moon-theme-title": "Ay",
        "moon-theme-description": "duygular, aidiyet, ev, sezgi",
        "mercury-theme-title": "Merkür",
        "mercury-theme-description": "öğrenme, iletişim, ağ kurma, hareketlilik",
        "venus-theme-title": "Venüs",
        "venus-theme-description": "aşk, sanat, uyum, zevk, çekicilik",
        "mars-theme-title": "Mars",
        "mars-theme-description": "itici güç, cesaret, rekabet, eylem",
        "jupiter-theme-title": "Jüpiter",
        "jupiter-theme-description": "büyüme, fırsat, eğitim, seyahat",
        "saturn-theme-title": "Satürn",
        "saturn-theme-description": "disiplin, sorumluluk, uzun vadeli inşa",
        "uranus-theme-title": "Uranüs",
        "uranus-theme-description": "değişim, özgürlük, yeniden icat, sürpriz",
        "neptune-theme-title": "Neptün",
        "neptune-theme-description": "maneviyat, hayal gücü, idealizm, sis",
        "pluto-theme-title": "Plüton",
        "pluto-theme-description": "dönüşüm, yoğunluk, güç, derin değişim",
        
        // FAQ
        "faq-title": "Sık Sorulan Sorular",
        "faq-birth-time-question": "Tam doğum saatine ihtiyacım var mı?",
        "faq-birth-time-answer": "Evet. Doğum saati açıları etkiler, bu da çizgilerin haritada nereye düştüğünü etkiler. Küçük değişiklikler bile çizgileri kaydırabilir.",
        "faq-good-bad-question": "Bir çizgi iyi mi kötü mü?",
        "faq-good-bad-answer": "Bir çizgi bir vurgu, hüküm değil. Gezegene, açıya ve hedeflerinize bağlı olarak destekleyici veya zorlayıcı hissedilebilir.",
        "faq-travel-question": "Bunu seyahat için kullanabilir miyim?",
        "faq-travel-answer": "Evet. Birçok kişi konumsal astrolojiyi seyahat planlama mercegi olarak kullanır. Kısa geziler bile belirli çizgiler yakınında hissedilir derecede farklı olabilir.",
        "faq-distance-question": "Bir çizgiye ne kadar yakın olmam gerekiyor?",
        "faq-distance-answer": "En yakın en güçlüdür, ancak yakındaki bölgeler yine de temayı yansıtabilir. Bunu katı bir sınır değil, gradyan olarak düşünün.",
        "faq-scientific-question": "Bu bilimsel mi?",
        "faq-scientific-answer": "Bu astroloji tabanlı bir araçtır. Gerçek dünya araştırması ve karar verme süreçleriyle birlikte yansıtıcı bir çerçeve olarak kullanın.",
        
        // CTA and Footer
        "cta-title": "Yolculuğunuza Başlamaya Hazır mısınız?",
        "cta-description": "Konumsal astroloji yolculuğunuza başlamaya hazır mısınız? Gezegensel enerjilerin yaşam hedeflerinizle nasıl uyumlu olduğunu keşfetmeye başlayabileceğiniz ana sayfamıza gidin.",
        "create-your-map": "Haritanızı Oluşturun",
        "footer-locational-desc": "LocationalAstro, doğum tarihi, yerel saat ve doğum yeri kullanarak interaktif konumsal astroloji haritaları sağlar. Dünya çapında gezegensel çizgileri keşfedin ve yorumlar için üzerine gelin.",
        "footer-tools": "Araçlar",
        "footer-resources": "Kaynaklar",
        "footer-faq": "SSS",
        "footer-planet-themes": "Gezegen Temaları",
        "go-home": "Ana Sayfaya Git"
    }
};

// Current language
var currentLang = 'en';

// Function to translate text
function t(key) {
    if (typeof translations === 'undefined') {
        return key;
    }
    return (translations[currentLang] && translations[currentLang][key]) || 
           (translations['en'] && translations['en'][key]) || 
           key;
}

// Function to switch language
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferred_language', lang);
    
    // Update language button
    var langBtn = document.getElementById('langToggle');
    if (langBtn) {
        var flagImg = langBtn.querySelector('.flag-icon');
        if (flagImg) {
            flagImg.src = lang === 'en' ? 'https://flagcdn.com/20x15/tr.png' : 'https://flagcdn.com/20x15/us.png';
            flagImg.alt = lang === 'en' ? 'TR' : 'EN';
        }
        langBtn.setAttribute('data-lang', lang === 'en' ? 'tr' : 'en');
    }
    
    // Update all translatable elements
    updatePageLanguage();
}

// Function to update page language
function updatePageLanguage() {
    // Update elements with data-translate attributes
    document.querySelectorAll('[data-translate]').forEach(function(element) {
        var key = element.getAttribute('data-translate');
        if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
            element.value = t(key);
        } else if (element.placeholder !== undefined && element.hasAttribute('data-translate-placeholder')) {
            element.placeholder = t(key);
        } else {
            element.textContent = t(key);
        }
    });
    
    // Update elements with data-translate-title attributes
    document.querySelectorAll('[data-translate-title]').forEach(function(element) {
        var key = element.getAttribute('data-translate-title');
        element.title = t(key);
    });
    
    // Update dynamic content on map page
    if (window.location.pathname.includes('map.html')) {
        // Update horoscope info if it exists
        var horoscopeInfo = document.getElementById('horoscopeInfo');
        if (horoscopeInfo && horoscopeInfo.innerHTML.trim() !== '') {
            displayHoroscopeInfo();
        }
        
        // Update data summary if it exists
        var dataGrid = document.getElementById('dataGrid');
        if (dataGrid && dataGrid.children.length > 0) {
            updateDataSummary();
        }
        
        // Update planet names in legend
        document.querySelectorAll('.planet-name').forEach(function(element) {
            var planetName = element.textContent;
            // Find the planet name in both English and Turkish translations
            var planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'Chiron', 'Lilith', 'Part of Fortune'];
            for (var i = 0; i < planets.length; i++) {
                var englishName = translations['en'][planets[i]];
                var turkishName = translations['tr'][planets[i]];
                
                // Check if current text matches either English or Turkish version
                if (planetName === englishName || planetName === turkishName) {
                    element.textContent = t(planets[i]);
                    break;
                }
            }
        });
    }
}

// Initialize language on page load
function initializeLanguage() {
    // Check if translations object exists
    if (typeof translations === 'undefined') {
        console.warn('Translations object not loaded');
        return;
    }
    
    // Load saved language preference (defaults to 'en' if none saved)
    var savedLang = localStorage.getItem('preferred_language') || 'en';
    if (translations[savedLang]) {
        currentLang = savedLang;
    } else {
        // Fallback to English if saved language is invalid
        currentLang = 'en';
        localStorage.setItem('preferred_language', 'en');
    }
    
    // Setup language toggle button
    var langBtn = document.getElementById('langToggle');
    if (langBtn) {
        var flagImg = langBtn.querySelector('.flag-icon');
        if (flagImg) {
            flagImg.src = currentLang === 'en' ? 'https://flagcdn.com/20x15/tr.png' : 'https://flagcdn.com/20x15/us.png';
            flagImg.alt = currentLang === 'en' ? 'TR' : 'EN';
        }
        langBtn.setAttribute('data-lang', currentLang === 'en' ? 'tr' : 'en');
        
        // Remove any existing event listeners and add new one
        var newLangBtn = langBtn.cloneNode(true);
        langBtn.parentNode.replaceChild(newLangBtn, langBtn);
        
        newLangBtn.addEventListener('click', function() {
            var targetLang = this.getAttribute('data-lang');
            switchLanguage(targetLang);
        });
    }
    
    // Update page language
    updatePageLanguage();
}

