# Locational Astrology / Astrocartography Map Generator

A comprehensive interactive web application that generates professional astrocartography maps based on birth data. Shows curved planetary lines across a world map indicating locations where planets were on specific angles (AC/DC/MC/IC) at the time of birth.

## ✨ Features

### 🌍 Interactive Mapping
- Zoomable/pannable world map with Leaflet.js
- **AC/DC curved lines and MC/IC straight longitude lines** for accurate astrocartography
- Floating legend with toggle control
- Mobile-optimized responsive design

### 🪐 Complete Planetary Coverage
- **10 planets**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- **4 angles per planet**: Ascendant (AC), Descendant (DC), Midheaven (MC), Imum Coeli (IC)
- **40 total line types** with unique colors and symbols
- Visual planetary symbols placed along curved line paths

### 🧭 Smart Location Features
- **One-click geocoding** - enter any city name and get coordinates automatically
- **URL sharing** - generate shareable links for your astrocartography maps
- **Auto-load from URLs** - maps load automatically from shared parameters

### 📚 Professional Interpretations
- **Detailed popup content** for each planetary line
- **40 unique interpretations** covering all planet-angle combinations
- **Astrological insights** explaining the meaning of each line
- **Technical data** including RA, Dec, and coordinate information

### 📱 Modern User Experience
- **Responsive breakpoints** for desktop, tablet, and mobile
- **Touch-friendly interface** with optimized tap targets
- **Glassmorphism UI design** with modern gradients and blur effects
- **Keyboard shortcuts** (Enter key for geocoding)

## 🛠️ Tech Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES5 for compatibility)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Geocoding**: OpenStreetMap Nominatim API (free, no API key required)
- **Calculations**: Spherical trigonometry for curved astrocartography lines
- **Astronomy**: Julian Day, Sidereal Time, and planetary position algorithms

## 🚀 Usage

1. **Open** `index.html` in any modern web browser
2. **Enter your birth data** or use the pre-filled default values
3. **Use geocoding**: Type a city name and click 📍 or press Enter
4. **Generate map**: Click "Generate Map" to see your astrocartography chart
5. **Explore**: Click any line for interpretations, toggle legend with ☰ button
6. **Share**: Use "Share Map" to generate a shareable URL

## 🎯 Astrocartography Line Types

- **MC (Midheaven)**: Where planets culminate at zenith - career/reputation themes
- **IC (Imum Coeli)**: Where planets anti-culminate - home/family themes  
- **AC (Ascendant)**: Where planets rise - identity/self-expression themes
- **DC (Descendant)**: Where planets set - relationship/partnership themes

## 🌟 What Makes This Special

- **Accurate curved lines**: Unlike simple parallel longitude lines, this uses proper spherical calculations
- **Professional interpretations**: Each line includes meaningful astrological guidance
- **Complete coverage**: All 10 major planets with outer planet calculations
- **No dependencies**: Runs completely offline after initial load
- **Mobile-first**: Designed to work perfectly on all devices

## 🔮 Future Enhancements

- Swiss Ephemeris integration for research-grade accuracy
- Additional asteroids and sensitive points
- PDF export functionality  
- Historical ephemeris data for past centuries
- Advanced aspects and parans calculations