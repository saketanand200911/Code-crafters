# Code Crafters

Static deployment of the Unmake AI interface from `index.html`.

## Deploy with Vercel

Import this repository into Vercel. Vercel will detect the Vite project, run
`npm run build`, and serve the generated `dist/` directory.

## Deploy with GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` publishes the repository
root as a static site whenever changes are pushed to `main`.

After the first workflow run, open the repository's **Settings → Pages** page
and confirm that the source is set to **GitHub Actions**.

## Local development

```bash
npm install
npm run dev
```

The optional Express/Gemini server is kept for local experimentation. Its
credentials must be provided through `.env` and are intentionally excluded
from Git.
