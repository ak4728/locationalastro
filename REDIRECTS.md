# Redirects / 301 examples

This file contains example 301 redirect rules you can deploy on common hosts to point duplicate or alternate URLs to their canonical pages for SEO.

Canonical URLs (as used on this site):
- https://locationalastro.com/
- https://locationalastro.com/locational-astrology.html
- https://locationalastro.com/map.html
- https://locationalastro.com/create-social-image.html

Guidelines:
- Use 301 (permanent) redirects from duplicate/alternate URLs to the canonical URL.
- Prefer server-level redirects over JavaScript redirects.
- After deploying redirects, update `sitemap.xml` to list only canonical URLs and request re-indexing in Google Search Console.

Netlify (`_redirects` file at site root):

# Redirect variations to canonical pages
/old-map.html  /map.html  301
/map  /map.html  301
/index  /  301
/create-image  /create-social-image.html  301

Apache (`.htaccess` in site root, with mod_rewrite enabled):

RewriteEngine On
# Redirect /map to /map.html
RewriteRule ^map/?$ /map.html [R=301,L]
# Redirect index or /index.html to root
RewriteRule ^(index|index.html)?$ / [R=301,L]
# Example: redirect legacy path
RewriteRule ^old-map.html$ /map.html [R=301,L]

Nginx (server block snippets):

# Redirect /map to /map.html
location = /map {
    return 301 https://locationalastro.com/map.html;
}

# Redirect /index or /index.html to /
location ~* ^/(index|index.html)$ {
    return 301 https://locationalastro.com/;
}

IIS (web.config rewrite rule):

<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Redirect old-map" stopProcessing="true">
          <match url="^old-map.html$" />
          <action type="Redirect" url="/map.html" redirectType="Permanent" />
        </rule>
        <rule name="Redirect map no-ext" stopProcessing="true">
          <match url="^map$" />
          <action type="Redirect" url="/map.html" redirectType="Permanent" />
        </rule>
        <rule name="Redirect index to root" stopProcessing="true">
          <match url="^(index|index.html)$" />
          <action type="Redirect" url="/" redirectType="Permanent" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>

Cloudflare Page Rules (example):
- If URL matches `*locationalastro.com/old-map.html` -> Forwarding URL (301) to `https://locationalastro.com/map.html`

Testing locally:
- Use `curl -I https://your-site/...` to confirm `HTTP/1.1 301 Moved Permanently` and `Location:` header.

After applying redirects:
- Update `sitemap.xml` so it contains only canonical URLs.
- In Google Search Console: Inspect URL -> Request Indexing for canonical pages.

If you want, I can also:
- Generate a ready-to-deploy `_redirects` file for Netlify.
- Prepare an `web.config` file and back it up into the repo.
- Update `sitemap.xml` to reflect canonical URLs now.
