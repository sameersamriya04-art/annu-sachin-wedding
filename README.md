# Annu & Sachin — Luxury Animated Wedding E-Invitation

Cinematic, scroll-driven, bilingual (Hindi + English), mobile-first wedding invitation website.
Designed & created by **Sameer Samriya**.

```
annu-sachin-wedding/
├── index.html          ← the whole invitation (11 sections)
├── styles.css          ← mobile-first styles, palette, reduced-motion & fallback rules
├── main.js             ← GSAP ScrollTrigger scenes, countdown, WhatsApp RSVP, share,
│                          music, calendar, dependency-free fallback motion engine
├── assets/
│   ├── img/            ← edited photographs (jpg + webp) and og-image.jpg
│   ├── svg/            ← all illustrations (palace, aisle, garden, mandap, lake, hearts,
│   │                      frame, divider, ganesh, garland, petals) + venue-qr.svg
│   └── audio/          ← put your licensed music file here as music.mp3
└── README.md
```

No build step. Pure HTML / CSS / JS. GSAP 3.12.5 + ScrollTrigger are loaded from the cdnjs CDN.

---

## 1 · Before publishing (2 small things)

1. **Music** — the family-supplied "Bulleya" flute instrumental is at `assets/audio/music.mp3`. To use a different track, replace it as
   `assets/audio/music.mp3` (≈ 2–4 MB, 128 kbps is plenty). Until it exists the music button
   shows a "music not added yet" message instead of pretending to play.
   Free, licensed sources: Pixabay Music, Free Music Archive, YouTube Audio Library
   (check each track's licence allows web use).
2. **Open-Graph link preview** — `og:image` is relative. After deploying, change the line in
   `index.html` to your full URL, e.g.
   `<meta property="og:image" content="https://USERNAME.github.io/annu-sachin-wedding/assets/img/og-image.jpg">`
   so WhatsApp shows the couple's photo when the link is shared.

Optional: the Haldi and Mehndi/Sangeet are marked **Family Home**; the Baraat, Wedding & Dinner and
Pheras are marked **Satyanarayan Dharamshala**. If the split is different, edit the
`event--home` / `event--hall` classes and the "Family Home / Dharamshala" lines in `index.html`.

---

## 2 · Run locally

Open `index.html` directly in a browser, or (recommended) serve the folder:

```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
```
then visit http://localhost:8080

---

## 3 · Free hosting on GitHub Pages (5 minutes)

1. Create a free account at https://github.com and click **New repository**.
   Name it e.g. `annu-sachin-wedding`, keep it **Public**, click **Create repository**.
2. Click **uploading an existing file**, drag the *contents* of this folder
   (index.html, styles.css, main.js, assets/, README.md) into the page, click **Commit changes**.
   (Or with git: `git init && git add . && git commit -m "Wedding invitation" && git branch -M main && git remote add origin https://github.com/USERNAME/annu-sachin-wedding.git && git push -u origin main`)
3. In the repository go to **Settings → Pages**.
   Under *Build and deployment* choose **Source: Deploy from a branch**, Branch: **main**, folder **/ (root)**, click **Save**.
4. Wait 1–2 minutes. Your invitation is live at
   `https://USERNAME.github.io/annu-sachin-wedding/`
5. Share that link on WhatsApp. (Optional: buy a custom domain and add it under Settings → Pages → Custom domain.)

Alternatives that work identically with this folder: **Netlify Drop** (drag the folder onto
app.netlify.com/drop), **Vercel**, **Cloudflare Pages**.

---

## 4 · What is wired and how it works

| Feature | Implementation |
|---|---|
| Live countdown | Counts to **28 Jan 2027, 7:00 PM IST** (`WEDDING.start` in `main.js`); switches to a wedding-day message afterwards. |
| WhatsApp RSVP | Validates name, 10-digit mobile, attendance, team; opens `https://wa.me/919079393817?text=…` with a formatted message. **Nothing is stored** on the site. |
| Google Maps | Directions button + QR code (`assets/svg/venue-qr.svg`) both point to https://maps.app.goo.gl/Ah7Nt4VfwW95Mtj87 |
| Add to calendar | Google Calendar link + downloadable `.ics` (generated in the browser, with a 1-day reminder). |
| Share | Native share sheet (`navigator.share`) on phones; otherwise WhatsApp share + link copied. |
| Hashtag | Tap to copy `#AnnuWedsSachin`. |
| Music | `<audio loop>` with play/pause, pauses when the tab is hidden; disabled state if the file is missing. |
| Contacts | Tap-to-call cards for Mohit Samriya (bride's family) and the groom's family. |
| Scroll animation | GSAP ScrollTrigger: pinned, scrub-linked hero (sky / palace / aisle / garland parallax), card unfold, garden parallax, heart pops, clip-path photo reveals with shine, timeline slides, mandap & lake parallax, word-by-word title reveals. |
| Fallbacks | `prefers-reduced-motion` → static, fully readable page. If the GSAP CDN is blocked → a built-in IntersectionObserver + requestAnimationFrame engine still provides reveals and parallax. No-JS → all content visible. |

### Editing content
All text lives in `index.html`; names, dates, numbers and links used by scripts are at the top of `main.js` (`WEDDING` object). Colours are CSS variables at the top of `styles.css`.

---

## 5 · Mobile testing checklist (done in headless Chrome; repeat on real phones)

Tested widths: **360, 375, 390, 430, 820 (tablet), 1440 (desktop)**.

- [x] No horizontal scrolling at any width (`scrollWidth === innerWidth`)
- [x] No console errors (only the expected offline-sandbox CDN/font network failures)
- [x] No broken images; all SVGs and both photographs load
- [x] Every section present, nothing clipped or overlapping
- [x] Countdown shows correct days/hours/minutes/seconds and ticks every second
- [x] RSVP: empty submit is blocked with a message; valid submit opens the correct `wa.me/919079393817` URL with all fields
- [x] Map link, tel: links, Google Calendar link and `.ics` download are correct
- [x] Hashtag copy shows the "copied" toast; share button wired
- [x] Music button reports clearly when `music.mp3` is missing
- [x] "Late Shri Karan Samriya" shown everywhere the father is named
- [x] Creator signature **SAMEER SAMRIYA** visible in the final scene
- [x] Reduced-motion: page readable with animations off

To finish on real devices (needs internet for the GSAP CDN and Google Fonts):
- [ ] Open the live URL on an Android phone (Chrome) and an iPhone (Safari); scroll start to end
- [ ] Confirm the hero pins and the palace/aisle move with your thumb (GSAP mode)
- [ ] Tap music ▶ after adding `music.mp3`
- [ ] Submit a test RSVP and confirm it lands on 9079393817
- [ ] Share the link in a WhatsApp chat and check the preview card

> Note on testing: the build sandbox had no internet, so the GSAP timelines were reviewed but
> executed only via the fallback engine; the first scroll-through on a real phone (above) is
> the one remaining check.
