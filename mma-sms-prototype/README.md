# Mubarak Model Academy, Ege: School Management System prototype

A clickable prototype covering admissions, students, academics, attendance, results, fees, staff and payroll, communication, library, health, inventory and reports, with Admin, Teacher and Parent views (switch role at the top).

All data is fictional and generated in the browser. Nothing is saved. Grading, fee, pension and PAYE rules are placeholders until the school confirms its own.

## Run locally
Open `index.html` in a browser. No build step. (Fonts load from Google Fonts; system fonts are used if offline.)

## Put it on GitHub and host it
1. Create a new repository on GitHub (public or private) and push this folder to the `main` branch:
   ```
   git init && git add . && git commit -m "School management prototype"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In the repository go to **Settings > Pages** and set **Source** to **GitHub Actions**. The included workflow deploys on every push to `main`.
3. Your site appears at `https://<you>.github.io/<repo>/` after the workflow finishes (Actions tab).

**Public or private:** a public repository gives a public site. A private repository can publish a private site only on GitHub Enterprise Cloud (access limited to people with repository access); on Free/Pro/Team plans, private repos cannot use Pages, so use a public repo, or host the folder on Netlify, Cloudflare Pages or Vercel with password protection.

Keyboard: press `/` to search students and staff.
