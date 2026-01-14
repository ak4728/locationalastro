function calculatePartOfFortune(jd) {
    // Part of Fortune = ASC + Moon - Sun (in ecliptic longitude)
    var sunPos = getPlanetPosition('Sun', jd);
    var moonPos = getPlanetPosition('Moon', jd);
    
    // Convert RA to ecliptic longitude (simplified)
    var sunLon = sunPos.ra;
    var moonLon = moonPos.ra;
    
    // ASC would be local - we'll use a simplified formula
    // For now, use Moon + 90 degrees as approximation
    var fortuneLon = (moonLon + 90 - sunLon + 360) % 360;
    
    // Convert back to RA/Dec
    var epsilon = 23.43928 * Math.PI / 180;
    var lambdaRad = fortuneLon * Math.PI / 180;
    
    var raRad = Math.atan2(Math.sin(lambdaRad) * Math.cos(epsilon), Math.cos(lambdaRad));
    var decRad = Math.asin(Math.sin(epsilon) * Math.sin(lambdaRad));
    
    var ra = raRad * 180 / Math.PI;
    if (ra < 0) ra += 360;
    
    return { ra: ra, dec: decRad * 180 / Math.PI };
}