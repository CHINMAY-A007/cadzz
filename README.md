# Cadzz Website

Static marketing site for Cadzz: AI voice agents, AI automation, WhatsApp and messaging, autonomous AI agents, inventory platforms, and custom AI infrastructure.

The site is plain HTML, CSS, and JavaScript. There is no build step.

## Files

- `index.html` - home page
- `privacy/index.html` - privacy policy (draft, needs legal review)
- `terms/index.html` - terms and conditions (draft, needs legal review)
- `404.html` - not-found page
- `css/styles.css` - all styling, tokens, layout, and motion
- `js/main.js` - theme toggle, mobile menu, form validation, scroll reveals, process line, capability rail
- `logo.svg` - CADZZ wordmark (CAD in currentColor, ZZ in accent)
- `logo-symbol.svg` - standalone double-Z symbol
- `favicon.svg` - favicon (double-Z symbol)
- `og-image.svg` - social preview image

## Run locally

No install needed. From the project folder:

```
python -m http.server 8000
```

Then open http://localhost:8000/

## Placeholders to replace before launch

Marked in the code with `PLACEHOLDER:` comments.

- `DOMAIN` - `cadzz.example` in canonical, Open Graph, and Twitter URLs (`index.html`, `privacy/index.html`, `terms/index.html`)
- `BOOKING_LINK` - `https://example.com/book-a-call` (nav, hero, contact, closing, mobile menus)
- `PHONE_NUMBER` - WhatsApp number `15550100199` (hero, contact, closing)
- `EMAIL_ADDRESS` - `contact@cadzz.example` (contact, footer, privacy, terms)
- `FORM_ENDPOINT_URL` - `js/main.js` (`FORM_ENDPOINT_URL = ''`). Empty uses a mailto fallback. Set to a real endpoint URL to post JSON.

## Contact form

Validates name, phone, email, and brief client-side. With no endpoint configured, it opens the visitor's email app with the message pre-filled and addressed to the fallback email.

## Motion and accessibility

- Vertical scroll reveals, hero drift columns, voice waveform, and process line use transform and opacity only.
- `prefers-reduced-motion: reduce` disables all animation and shows static layouts.
- Dark and light themes via CSS variables and a manual toggle stored in localStorage.

## Deploy

Hosted on GitHub Pages from the `main` branch root.

Live URL: https://chinmay-a007.github.io/cadzz/

To redeploy, commit and push to `main`:

```
git add .
git commit -m "Update site"
git push
```
