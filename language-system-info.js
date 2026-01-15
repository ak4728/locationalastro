// Language System Test - How it works now
// ===========================================

// 1. User visits any page (index.html, locational-astrology.html, map.html)
//    → initializeLanguage() is called
//    → Checks localStorage.getItem('preferred_language')
//    → Sets currentLang to saved preference (or 'en' if none)

// 2. User clicks language toggle on any page
//    → switchLanguage() is called with new language ('en' or 'tr')
//    → localStorage.setItem('preferred_language', newLang)
//    → updatePageLanguage() updates all text on current page

// 3. User navigates to another page (clicks Home, Learn, etc.)
//    → Normal navigation with clean URLs (no ?lang= parameters)
//    → New page loads and calls initializeLanguage()
//    → Automatically loads saved language from localStorage
//    → Page displays in user's preferred language

// Benefits:
// ✅ No URL parameters needed
// ✅ Language persists across all pages automatically
// ✅ Clean URLs
// ✅ Works on browser refresh
// ✅ Independent of page - set once, works everywhere
// ✅ Survives browser close/reopen (localStorage persists)

// Example user journey:
// 1. Visit index.html (English by default)
// 2. Click Turkish flag → Page switches to Turkish
// 3. Click "Learn" link → locational-astrology.html loads in Turkish automatically
// 4. Click "Home" link → index.html loads in Turkish automatically
// 5. Close browser, reopen later → Still Turkish on all pages