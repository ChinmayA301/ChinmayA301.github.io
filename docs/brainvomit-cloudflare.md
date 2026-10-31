# Brain Vomit on Cloudflare Pages

The portfolio and publication share one Jekyll source tree but produce separate deployable sites.

## Cloudflare Pages build settings

- Production branch: `main`
- Build command: `bash scripts/build_brainvomit.sh`
- Build output directory: `_site_brainvomit`
- Ruby version: `3.4.4`
- Custom domain: `brainvomit.blog`

The standalone build uses `_config.yml,_config.brainvomit.yml`. The custom Jekyll plugin converts legacy `/blog/<slug>/` article URLs to `/<slug>/`, changes canonicals to `https://brainvomit.blog`, and preserves old path values for the existing Giscus discussions.

## Porkbun cutover

1. Add `brainvomit.blog` as a website in Cloudflare.
2. Copy the two assigned Cloudflare nameservers.
3. In Porkbun, open the domain's authoritative nameserver settings and replace the Porkbun nameservers with the two Cloudflare nameservers.
4. Wait until Cloudflare marks the zone active.
5. In the Pages project, add `brainvomit.blog` and `www.brainvomit.blog` as custom domains.
6. Redirect `www.brainvomit.blog/*` permanently to `https://brainvomit.blog/$1`.

Do not enable the legacy portfolio redirect until the custom domain serves the validated publication over HTTPS.

## Legacy portfolio redirect

After the new domain is live, configure a Cloudflare redirect on the `chinmayarora.com` zone:

- `/blog/` → `https://brainvomit.blog/`
- `/blog/<slug>/` → `https://brainvomit.blog/<slug>/`

Preserve the path after `/blog` and return HTTP `301`. Keep this redirect in place for at least one year.
