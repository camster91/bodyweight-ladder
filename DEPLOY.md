# Deploying Bodyweight Ladder

Bodyweight Ladder is a **static site**: one `index.html` plus images. There is no build step, no database and no server code. Any web server can host it.

> **Saving on a self-hosted copy:** outside claude.ai the app saves progress **in the browser** (localStorage) on each device. Cross-device sync only works in the claude.ai-hosted version. Adding a small sync backend is a later step.

---

## Prompt for an AI agent on the VPS

Copy everything in the box into Claude Code (or any coding agent) running on the VPS. Fill in the two values at the top first.

```text
Deploy the static web app "Bodyweight Ladder" on this server.

DOMAIN: <your domain, e.g. ladder.example.com>
REPO:   https://github.com/camster91/bodyweight-ladder  (private; use my existing GitHub access on this server, e.g. an SSH deploy key or gh auth)

What it is: a static site. Files to serve are index.html, manifest.webmanifest, img/ and assets/brand/. No build step, no backend, no database. Do NOT serve tests/, node_modules/, package*.json or .git.

Steps:
1. Check what this server already uses to serve sites (Caddy, nginx, Traefik, Coolify, Docker, etc.) and follow that pattern instead of adding a new web server. Tell me what you found before changing anything.
2. Clone (or pull) the repo to a sensible place such as /var/www/bodyweight-ladder (or the equivalent volume if sites run in Docker/Coolify).
3. Serve the repo root as the site root for DOMAIN with HTTPS (Let's Encrypt via the existing setup). Redirect HTTP to HTTPS.
4. Headers:
   - index.html and manifest.webmanifest: Cache-Control "no-cache"
   - img/* and assets/*: Cache-Control "public, max-age=2592000"
   - Make sure .webp is served as image/webp and .webmanifest as application/manifest+json
   - Add: X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin
   - Block access to /.git, /tests, /node_modules, package.json, package-lock.json
5. If DNS for DOMAIN does not point at this server yet, stop and tell me the A/AAAA record to add.
6. Add a one-command update script at /usr/local/bin/deploy-ladder that does `git pull --ff-only` in the site folder (and reloads the web server only if its config changed). Make it safe to run repeatedly.
7. Verify:
   - curl -I https://DOMAIN returns 200 with a valid certificate
   - https://DOMAIN/img/icon.webp returns 200 with image/webp
   - https://DOMAIN/manifest.webmanifest returns 200
   - https://DOMAIN/.git/config and https://DOMAIN/tests/ return 403 or 404
8. Report back in plain language: the URL, where the files live, how to update (deploy-ladder), and anything I need to do (like DNS).

Do not change or restart other sites on this server without asking me first.
```

---

## Manual setup (if you'd rather do it yourself)

**Caddy** (`/etc/caddy/Caddyfile`):

```caddy
ladder.example.com {
	root * /var/www/bodyweight-ladder
	@blocked path /.git* /tests* /node_modules* /package.json /package-lock.json
	respond @blocked 404
	@static path /img/* /assets/*
	header @static Cache-Control "public, max-age=2592000"
	header /index.html Cache-Control "no-cache"
	header {
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
	}
	file_server
}
```

**nginx**:

```nginx
server {
  server_name ladder.example.com;
  root /var/www/bodyweight-ladder;
  index index.html;
  location ~ /(\.git|tests|node_modules)|package(-lock)?\.json { return 404; }
  location ~* ^/(img|assets)/ { add_header Cache-Control "public, max-age=2592000"; try_files $uri =404; }
  location = /index.html { add_header Cache-Control "no-cache"; }
  types { application/manifest+json webmanifest; image/webp webp; }
  add_header X-Content-Type-Options nosniff;
  add_header Referrer-Policy strict-origin-when-cross-origin;
  # then: certbot --nginx -d ladder.example.com
}
```

**Update after new commits:**

```bash
cd /var/www/bodyweight-ladder && git pull --ff-only
```

## Add to your phone's home screen
Open the site on your phone, then:
- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ → Add to Home screen / Install app

It opens full screen with the Bodyweight Ladder icon.
