# Easy Group — Marketing Website

A premium, dark-themed React site for Easy Group (printing, branding, advertising &amp; exhibition solutions), built with React Router and plain CSS (custom properties, no framework lock-in).

## Stack
- React 18 + Vite
- React Router DOM v6 (client-side routing, no full reloads)
- lucide-react for icons
- Plain CSS with a token system in `src/index.css` (easy to port to Tailwind if preferred)

## Pages
- `/` — Home (hero, intro, services, featured projects, why us, CTA)
- `/projects` — Filterable project grid with a detail modal
- `/contact` — Contact form + info + map section

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy
- `vercel.json` is included so client-side routes (`/projects`, `/contact`) resolve correctly on Vercel.
- For Netlify, add a `public/_redirects` file with: `/*  /index.html  200`

## Structure
```
src/
  components/   Navbar, Footer, Button, ServiceCard, ProjectCard, CropMarks (signature motif), ScrollToTop
  pages/        Home, Projects, Contact
  data/         services.js, projects.js — edit these to change content/images
  hooks/        useReveal.js — scroll-reveal animation hook
  styles/       layout.css (navbar/hero/sections), pages.css (project grid, contact form, modal)
  index.css     design tokens (colors, type, buttons, reveal animation)
```

## Notes
- Swap the Unsplash placeholder URLs in `src/data/*.js` for real project photography whenever it's ready.
- Brand colors, fonts and spacing all live as CSS custom properties at the top of `src/index.css` — change them once, they cascade everywhere.
- The circular crosshair mark (`.reg-mark`) and corner crop-marks (`.crop-mark`, via the `<CropMarks />` component) are the site's recurring signature motif, borrowed from print registration marks — use them sparingly on new sections to stay consistent.
