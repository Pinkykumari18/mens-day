# Men's Day Scan Surprise

Theme: Dark Gentleman (charcoal black, cream text and brass gold, serif fonts).

Each of the 20 men scans his own QR code. An animation plays (gift box, curtains, countdown or polaroid), then his full photo (never cropped), name and personal wish appear on a golden card. He can also tap "Save card" to download it as an image. The page is built for phones and works with portrait, landscape and square photos.

## What is inside

| File | Purpose |
|---|---|
| `index.html`, `style.css`, `script.js` | The scan page (you do not need to edit these) |
| `data.js` | **Edit this:** names, tags, wishes, animation per person |
| `photos/` | **Put the 20 photos here** as `01.jpg` ... `20.jpg` |
| `tools/qr-generator.html` | Makes the 20 QR codes (open it in your browser) |
| `tools/optimize_photos.py` | Optional: shrinks and renames phone photos for you |
| `vercel.json` | Vercel settings (nothing to change) |

## Step 1: add photos

Name them `01.jpg` to `20.jpg` (`.png` and `.webp` also work) and put them in `photos/`. The number must match the `id` in `data.js`.

Phone photos are big. Either keep each under about 500 KB, or let the script do it:

```
pip install pillow
python3 tools/optimize_photos.py "path/to/your/raw/photos"
```

It resizes everything, fixes sideways photos, and saves them as `01.jpg`, `02.jpg` ... in the order of the file names. It prints which file became which number, so check that it matches your list.

## Step 2: edit data.js

For each person set `name`, `tag` (the small title chip), `wish`, and `scene` (`gift`, `curtain`, `countdown` or `polaroid`). The names and wishes in the file are placeholders. At the top, `CONFIG.from` can hold your name or team, shown as "With love, ...".

## Step 3: test on your computer

```
python3 -m http.server 8000
```

Open `http://localhost:8000/?id=01`. Try `?id=02`, `?id=03` and so on. To preview any animation on any person, add `&scene=curtain` (or `gift`, `countdown`, `polaroid`).

## Step 4: deploy on Vercel

Option A, command line (fastest):

```
npm i -g vercel
vercel login
vercel --prod
```

Answer the questions with the defaults. If it asks for a framework or build command, choose "Other" and leave the build command empty. It is a plain static site.

Option B, GitHub: push this folder to a GitHub repository, then in Vercel choose "Add New Project", import the repository and press Deploy (framework "Other", no build command).

You will get an address like `https://mens-day-xyz.vercel.app`.

## Step 5: make the QR codes

1. Open `tools/qr-generator.html` in your browser (double-click it; internet is needed once to load the QR library).
2. Paste your Vercel address and press **Generate QR codes**.
3. Press **Download all (ZIP)** for 20 PNG files, or **Print** for a ready sheet.
4. Scan one with your phone to confirm it works before printing all of them.

Each QR opens `your-site.vercel.app/?id=01`, `?id=02`, and so on.

## Good to know

- The links are not secret. Anyone who guesses another id (`?id=07`) can open that page. If that matters, change the ids in `data.js` to something longer, like `rahul-k7x2`, and regenerate the QR codes.
- The page is marked "noindex", so search engines should not list it.
- If you change a wish or photo after deploying, run `vercel --prod` again. The QR codes stay the same.
- Phones with "reduce motion" turned on skip the intro animation and go straight to the card.
