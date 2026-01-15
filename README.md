# Locational Astrology / Astrocartography Map Generator

A comprehensive interactive web application that generates professional astrocartography maps based on birth data. Shows curved planetary lines across a world map indicating locations where planets were on specific angles (AC/DC/MC/IC) at the time of birth.

## ✨ Features

### 🌍 Interactive Mapping
- Zoomable/pannable world map with Leaflet.js
- **AC/DC curved lines and MC/IC straight longitude lines** for accurate astrocartography
- **100 major world cities** displayed as red dots with hover tooltips
- Floating legend with toggle control and planet visibility toggles
- Mobile-optimized responsive design

### 🪐 Complete Planetary Coverage
- **13 celestial points**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, Chiron, Lilith, Part of Fortune
- **4 angles per planet**: Ascendant (AC), Descendant (DC), Midheaven (MC), Imum Coeli (IC)  
- **52 total line types** with unique colors and symbols
- **Line type labels** positioned at highest/lowest points of planetary lines
- Visual planetary symbols placed along curved line paths

### 🌟 Zodiac Integration
- **Sun/Moon/Rising signs** displayed in header with detailed hover tooltips
- **Complete zodiac calculations** with personality trait descriptions
- **Real-time zodiac display** updated based on birth data

### 🌐 Multi-Language Support
- **Bilingual interface**: Full English and Turkish translations
- **Smart language detection**: Automatically preserves language across pages
- **Complete localization**: Planet names, zodiac signs, UI elements, and descriptions
- **Flag-based language switcher** with actual country flag icons

### 🧭 Smart Location Features
- **One-click geocoding** - enter any city name and get coordinates automatically
- **URL sharing** - generate shareable links for your astrocartography maps
- **Auto-load from URLs** - maps load automatically from shared parameters
- **Map export** - save your astrology map as PNG image

### 📚 Professional Interpretations
- **Detailed popup content** for each planetary line  
- **52 unique interpretations** covering all planet-angle combinations
- **Astrological insights** explaining the meaning of each line
- **Technical data** including RA, Dec, and coordinate information

### 📱 Modern User Experience
- **Responsive breakpoints** for desktop, tablet, and mobile
- **Touch-friendly interface** with optimized tap targets
- **Glassmorphism UI design** with modern gradients and blur effects
- **Keyboard shortcuts** (Enter key for geocoding)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Mapping**: Leaflet.js for interactive world maps
- **Geocoding**: Nominatim geocoding service
- **Styling**: Custom CSS with glassmorphism effects
- **Responsive**: Mobile-first design approach

## 🚀 Local Development

To run this project locally and avoid CORS issues:

### Option 1: Use the provided batch file (Windows)
```bash
# Double-click or run in terminal
start-server.bat
```

### Option 2: Python HTTP Server
```bash
# Navigate to project directory
cd locationalastro

# Python 3.x
python -m http.server 8000

# Or Python 2.x
python -m SimpleHTTPServer 8000
```

### Option 3: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory and serve
cd locationalastro
http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## 🛠️ Tech Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+) 
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Geocoding**: OpenStreetMap Nominatim API (free, no API key required)
- **Astronomy**: Astronomy Engine for precise planetary calculations
- **Calculations**: Spherical trigonometry for curved astrocartography lines
- **Export**: Leaflet-image plugin for PNG map export
- **Internationalization**: Custom translation system with localStorage persistence

## 🚀 Usage

1. **Select Language**: Choose English 🇺🇸 or Turkish 🇹🇷 from the flag button
2. **Open** `index.html` in any modern web browser
3. **Enter your birth data** or use the pre-filled default values
4. **Use geocoding**: Type a city name and coordinates will auto-populate
5. **Generate map**: Click "Generate Map" to see your astrocartography chart
6. **Explore**: Click any line for interpretations, toggle planets in legend
7. **View cities**: Hover over red dots to see major world cities
8. **Check zodiac**: View your Sun/Moon/Rising signs in the header
9. **Save map**: Click 💾 to export your map as PNG image
10. **Share**: Generate shareable URLs that preserve language and data

## 🎯 Astrocartography Line Types

- **MC (Midheaven)**: Where planets culminate at zenith - career/reputation themes
- **IC (Imum Coeli)**: Where planets anti-culminate - home/family themes  
- **AC (Ascendant)**: Where planets rise - identity/self-expression themes
- **DC (Descendant)**: Where planets set - relationship/partnership themes

## 🌟 What Makes This Special

- **Bilingual support**: Complete Turkish and English localization
- **Accurate curved lines**: Unlike simple parallel longitude lines, uses proper spherical calculations
- **Professional interpretations**: Each line includes meaningful astrological guidance  
- **Complete coverage**: All major planets plus lunar nodes, asteroids, and Part of Fortune
- **Modern UX**: Glassmorphism design with instant tooltips and smooth animations
- **No dependencies**: Runs completely offline after initial load
- **Mobile-first**: Designed to work perfectly on all devices
- **Export ready**: Save and share your personalized astrology maps

## 🔮 Future Enhancements

- Additional language support (Spanish, German, French)
- Swiss Ephemeris integration for research-grade accuracy
- Additional asteroids and Arabic parts
- Advanced aspects and parans calculations
- Historical ephemeris data for past centuries