# Aven Towers

A cinematic, real-time property experience for Aven Towers in Lagos. Explore the eight-storey building, move through its residences, and prepare a private viewing request through an interactive 3D presentation.

## Run

Node 20.9+ is required; this project was built with Node 24.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For production:

```sh
npm run build
npm start
```

This is a Next.js application with a Node server, not a file you can double-click. A server is required for viewing requests.

## Checks

```sh
npm run check
npm test
```

With the local server running, `node tests/api-smoke.mjs` checks request validation, strict origin protection, reserved homes, private enquiry storage, and confirmation references. Its own disposable enquiry record is removed after the check.

## Experience

- Procedural eight-level tower with recessed balconies, glazing, timber screens, a branded entrance, and a furnished roof garden.
- Detailed neighboring buildings, planted streets, lighting, parking, and a Lagos urban setting.
- Cinematic camera direction, three building viewpoints, pointer parallax, day/dusk lighting, and reduced-motion support.
- Floor and bedroom filters, available and reserved homes, keyboard navigation, and residence details.
- Furnished one-, two-, and three-bedroom cutaways with kitchens, bathrooms, terraces, and interior finishes.
- Responsive layouts for desktop, tablet, and mobile with accessible native dialogs.

## Enquiries

Viewing requests are validated on the server and saved as individual private JSON files in `data/enquiries/`. Successful requests return an `AVN-…` reference. This directory is not served publicly and is excluded from Git. The operating system restricts enquiry files to the owner.

No email provider or CRM account was supplied. Enquiries are recorded for manual sales follow-up; email notifications are not automatically sent. Multi-server or ephemeral hosting needs a persistent database or storage service and a sales notification integration before launch.

## Content status

Lagos and NGN are used as the project context. Residence prices, areas, availability, amenities, and sales positioning are presentation content and need owner sign-off before commercial launch. No real street address, telephone number, sales email, planning approval, delivery date, named partner, customer review, or payment terms are represented as confirmed facts.

## Assets

All geometry is authored in the project. PBR material maps and interior HDR lighting are locally hosted CC0 Poly Haven assets. Credits and source links are in `public/materials/CREDITS.md`. The Manrope font is locally hosted under the SIL Open Font License, included in `public/fonts/OFL.txt`. No runtime third-party image or font request is required.

The supplied `real estate reference.mp4` is retained unchanged. Reference observations and design decisions are in [`DESIGN.md`](DESIGN.md); QA notes are in [`QA.md`](QA.md).
