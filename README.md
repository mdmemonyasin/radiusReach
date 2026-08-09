# radiusReach

Marketing & digital growth agency website — a fast, responsive, accessible one-page
site built in vanilla HTML/CSS/JS (no build step).

## Services featured
- **Meta Ads — Lead Generation** — ₹3,500/month flat service fee (ad budget separate, paid directly to Meta).
- **Online Presence & Brand Building** — website, SEO, Instagram/Facebook, content.

## Structure
- `index.html` — the full one-page site
- `styles.css` — design system + responsive/motion/a11y
- `script.js` — interactions + a `CONFIG` object (WhatsApp number, phone, email, form endpoint, prices)
- `privacy.html`, `terms.html`

## Configure before going live
Edit the `CONFIG` object at the top of `script.js` — set your real WhatsApp number, phone,
email, and (optionally) a form endpoint to make the contact form live.

## Local preview
Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
```
