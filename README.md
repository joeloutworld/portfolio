# Joel Cimanes: portfolio

My developer portfolio: a static site in plain HTML, CSS and JavaScript, with no framework and no build step.

**Live:** https://joeloutworld.github.io/portfolio/

## Features
- One page of work, plus five case-study pages in `work/`
- Real app screenshots, with client figures and names blurred
- A 3D carousel of production n8n workflows
- A canvas node-network background, paused when the tab is hidden, with a still frame for reduced motion
- A downloadable CV (`assets/joel-cimanes-cv.pdf`)

## How it's built
- The layout, tokens and motion come from a design-system kit in `assets/`.
- Page-specific code lives in `index.html` and `assets/site/`: `bg.js` holds the background, carousel, clocks and counters, and `case.css` styles the case-study pages.
- Screenshots were captured with Playwright, then masked in the page and with Pillow before saving.

## What I learned
- Presenting proof matters more than adding effects: the case studies follow problem → what I built → key decisions → results.
- Every animation has a reduced-motion path and pauses off-screen, to keep the page fast.

## Run locally
```bash
python -m http.server 8742
# open http://localhost:8742
```

## What could improve
- Short screen-recording loops in place of the still screenshots
- Client testimonials once approved
