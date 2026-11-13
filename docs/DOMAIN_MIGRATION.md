# Portfolio domain migration

Target: `https://chinmayarora.com/`. Current portfolio: `https://app.chinmayarora.com/`.
Brain Vomit remains at `https://brainvomit.blog/`.

This is a cutover plan. No DNS, hosting domain, CNAME, or production canonical changes have been made.

## Prepare

- Verify the apex domain in the GitHub account before changing the Pages custom domain.
- Inspect the apex's current DNS records and existing services before editing them. Preserve mail and unrelated subdomains.
- Confirm GitHub Pages domain verification, HTTPS issuance, and which service will retain the old `app` hostname for redirects. Verify current GitHub Pages and DNS-provider documentation at execution time; do not copy stale IP addresses from this plan.
- Save the current DNS and Pages configuration for rollback.

## Cutover release

1. Configure the apex DNS and Pages custom domain; confirm the certificate and HTTPS behavior.
2. Update `CNAME` and the portfolio URL in `_config.yml`.
3. Update portfolio canonical, Open Graph, Twitter image, structured-data, robots, and profile references. Search with `rg 'app\.chinmayarora\.com'` and classify each match before changing it. Keep historical references when they are intentional. Preserve Brain Vomit canonicals and API endpoints such as `rag.chinmayarora.com`.
4. Set a permanent redirect for `https://app.chinmayarora.com/<path>?<query>` to `https://chinmayarora.com/<path>?<query>`. Retain paths and queries; avoid redirect loops. Redirect hosting may need a separate DNS/proxy rule after Pages moves to the apex.
5. Build the main portfolio and Brain Vomit from the same revision. Validate canonicals, internal links, sitemap, feed, report links, and the separate publication boundary.

## Verify and finish

- Check the apex homepage, `/projects/`, `/dashboards/?view=freight`, `/coursework/`, and a nested route over HTTPS.
- Check old-host redirects for those paths and a query string; confirm a permanent response and the final canonical URL.
- Add/verify the new Search Console property, submit the new sitemap, and use Change of Address if eligible. Update Bing Webmaster Tools.
- Update GitHub profile, LinkedIn, résumé links, and other controlled public profiles.
- Keep the old-host redirects active and monitor broken links and indexing.

## Rollback

Restore the saved Pages custom domain and DNS configuration, revert the domain-change release, and confirm the old portfolio URL and HTTPS work before removing any temporary apex configuration.
