# Photo Gallery Guide

This file explains how the homepage photo gallery is set up and how future Codex runs should add new photos.

## Current Layout

- The gallery lives in `index.html` inside the `.photo-gallery` container on page 1.
- Each photo is wrapped in an anchor with class `photo-frame`.
- Every photo opens the original asset in a new tab.
- Photos are tagged with one of two orientation classes:
  - `landscape`
  - `portrait`
- The layout rules for those classes live in `styles/style.css`.

## Asset Location

- Store gallery images in `assets/images/`.
- Prefer lowercase filenames with underscores.
- Convert `.heic` files to `.jpg` before adding them to the site.

Examples:

- `assets/images/yackfam.jpeg`
- `assets/images/yackbros_ny_christmas.jpeg`
- `assets/images/yackfam_ny_dinner.jpg`

## How To Add Photos

1. Copy new images into `assets/images/`.
2. If an image is `.heic`, convert it to JPEG.
3. Add a new `<a class="photo-frame ...">` block to `.photo-gallery` in `index.html`.
4. Choose `portrait` or `landscape` based on the image orientation.
5. Add a short, specific `alt` description.
6. Keep the image linked to its own full-resolution asset.

## Markup Pattern

Use this exact pattern:

```html
<a class="photo-frame landscape" href="assets/images/example.jpg" target="_blank" rel="noreferrer">
  <img class="bros-photo" src="assets/images/example.jpg" alt="Short descriptive alt text">
</a>
```

For a portrait image:

```html
<a class="photo-frame portrait" href="assets/images/example.jpg" target="_blank" rel="noreferrer">
  <img class="bros-photo" src="assets/images/example.jpg" alt="Short descriptive alt text">
</a>
```

## Orientation Rule

- Use `landscape` when the image is wider than it is tall.
- Use `portrait` when the image is taller than it is wide.

Reason:

- `landscape` images are shown full-width.
- `portrait` images use a narrower centered frame so they fit better in the viewport.

## HEIC Conversion

On macOS, convert HEIC files like this:

```bash
sips -s format jpeg /path/to/input.heic --out /path/to/output.jpg
```

## Good Future Prompt For Codex

Use a prompt like this:

```text
Read PHOTO_GALLERY.md and add all new photos from ~/Downloads into the homepage gallery. Copy any new JPEGs into assets/images, convert any HEIC files to JPEG, add them to the .photo-gallery in index.html, choose portrait vs landscape correctly, write sensible alt text, and keep each image linked to its full-resolution asset. Do not redesign the layout unless I ask.
```

## Constraints

- Do not crop images.
- Do not replace the stacked gallery with a collage or horizontal scroller unless explicitly requested.
- Keep portrait images narrower than landscape images.
- Do not remove existing photos unless explicitly requested.
- Do not add captions unless explicitly requested.
- Do not put site-served images in Git LFS while the site is hosted on GitHub Pages. GitHub Pages serves the LFS pointer file instead of the real image, which breaks the gallery.

## Files Usually Touched

- `index.html`
- `styles/style.css`
- `assets/images/*`
