# Shishir’s Lab — Personal Portfolio & Creative Dossier

Official portfolio and creative lab of **Md Shahriar Shishir Sami** (**Shishir**).

- **Domains**: `shishirsami.com` & `www.shishirsami.com`
- **Target Repository**: `https://github.com/shishirsami33-maker/shishirsami`
- **Design Direction**: Midnight Black (`#030407`), Electric Cobalt (`#1558C9`), Acid Lime (`#D4FF24`).

---

## 1. Project Architecture

The website is engineered as a lightweight, high-performance static web application requiring no Node.js runtime, build tools, or database on the server:

```text
/
├── index.html                # Home: Entrance hero, choices, Under Construction state, Spotlight grid & lightbox
├── portfolio.html            # Portfolio: Featured video, masonry grid, project detail modal, portfolio tree, closing statement
├── about.html                # About: Profile, core capabilities, experience timeline, education, achievements, clean public CV
├── css/
│   └── style.css             # Unified design system & responsive layout
├── js/
│   ├── data.js               # Central structured metadata (projects, spotlight, experience, education)
│   └── main.js               # Engine for lightbox, masonry filters, video on-demand, and modals
├── assets/
│   ├── img/                  # Optimized WebP imagery (hero, 20 spotlight moments, completed events, built systems, certificates, designs)
│   ├── docs/                 # Original PDF pitch decks, research papers, and clean public CV
│   └── video/                # Video files and extracted WebP poster frames
├── robots.txt
├── sitemap.xml
└── .gitignore
```

---

## 2. Local Preview

You can preview the site locally using any standard static file server or Python:

```bash
# Option A: Python built-in server (recommended)
python -m http.server 8000

# Open in browser:
http://localhost:8000
```

Or with Node.js `npx serve`:

```bash
npx serve .
```

---

## 3. How to Edit Content

All projects, Spotlight photo metadata, achievements, timelines, and contact links are located in:
`js/data.js`

- **Add or edit projects**: Locate `SHISHIR_DATA.projects` in `js/data.js` and add/edit entries.
- **Update Spotlight photos**: Edit `SHISHIR_DATA.spotlight` array in `js/data.js`.
- **Update Experience**: Edit `SHISHIR_DATA.experience` in `js/data.js`.

---

## 4. GitHub & Hostinger Deployment Guide

### A. Git Repository Setup

If git is not yet initialized in this directory:

```bash
# 1. Initialize git
git init

# 2. Add files (source raw archives are excluded by .gitignore)
git add .

# 3. Commit
git commit -m "Build Shishir's Lab production website"

# 4. Set remote branch
git branch -M main
git remote add origin https://github.com/shishirsami33-maker/shishirsami.git

# 5. Push to GitHub (when ready)
git push -u origin main
```

*(Note: Per instructions, git pushes and publishes are never automated without explicit user direction.)*

---

### B. Hostinger Deployment via Git

1. Log into your **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Navigate to **Websites** → select `shishirsami.com` → **Manage**.
3. In the sidebar, go to **Advanced** → **Git**.
4. Enter the repository details:
   - **Repository**: `https://github.com/shishirsami33-maker/shishirsami.git`
   - **Branch**: `main`
   - **Directory**: leave empty or set to `/` (so files deploy directly to `public_html/`).
5. Click **Create**.
6. Whenever you push changes to GitHub, click **Deploy** in hPanel (or configure the Hostinger Webhook in your GitHub repository settings under **Settings** → **Webhooks** for automated deployment on push).

---

### C. Hostinger DNS Configuration for `shishirsami.com`

Ensure your domain points to Hostinger's nameservers or A records:

- **Hostinger Nameservers**:
  - `ns1.dns-parking.com`
  - `ns2.dns-parking.com`
- **Or Direct A Records**:
  - Host `@` points to your Hostinger server IP
  - Host `www` points to your Hostinger server IP (or CNAME to `shishirsami.com`)

*(Do not use the previous ChatGPT Sites DNS records.)*

---

© 2026 Md Shahriar Shishir Sami. Shishir’s Lab.

