# Portfolio migration: app.chinmayarora.com → chinmayarora.com

Prepared November 13, 2026, from merged portfolio revision `5d32cbce1509a746c824e5355d2a6a5895c4e2fb`. Scope selected by the owner: make the apex the portfolio's canonical address. This is the rollout plan; production DNS, Pages settings and canonical URLs have not been changed by this planning work.

## Destination and boundaries

| Surface | Intended URL |
| --- | --- |
| Portfolio | `https://chinmayarora.com/` |
| Existing routes | Same paths and queries on the apex |
| Dedicated live-data lab | `https://chinmayarora.com/live-data-lab/` |
| Old portfolio host | Redirect to the corresponding apex URL |
| Brain Vomit | `https://brainvomit.blog/`; portfolio backlinks change to the apex |
| Mail and independent apps/APIs | Retain existing records and service hosts |

Recommended architecture: GitHub Pages continues hosting the portfolio and lab. Cloudflare continues serving DNS and the old-host redirect. No GCP/Fly migration or new paid hosting is required for this domain change. Keep the apex DNS-only during initial GitHub certificate validation; reconsider proxying only after direct HTTPS works. This is a proposed record configuration, not a change to the current zone.

## Evidence and unresolved checks

- `https://app.chinmayarora.com/` returned HTTP 200. The apex returned HTTP 525 through Cloudflare. A 525 establishes a handshake failure, not the identity or configuration of the hidden origin; authenticated zone inspection is still required.
- Public apex A/AAAA answers are Cloudflare proxy addresses. They do not reveal the DNS record's underlying target. Nameservers are `amos.ns.cloudflare.com` and `emma.ns.cloudflare.com`.
- Apex MX answers are `mx00.ionos.com` and `mx01.ionos.com`, both priority 10. CAA includes `letsencrypt.org`. Full TXT/DKIM/SPF/DMARC and zone configuration have not been exported.
- GitHub's API reports portfolio custom domain `app.chinmayarora.com`, source `main:/`, build type `legacy`, and HTTPS enforcement false. An Actions Pages workflow also exists. Establish one publication method before cutover; the checked-in Jekyll workflow is the intended candidate. Test switching publication mode separately while the old domain is still active.
- The lab has its own workflow deployment and no custom domain; its Pages URL inherits the portfolio hostname. The source contains absolute old-host links and API origins.
- No answer was returned for the queried GitHub domain-verification TXT name. Check the GitHub account's verified-domain status rather than treating that query as definitive.
- The free collector workflow is active, but the queried run history contained only four initial push/manual deployments. Automatic collection remains unverified. Keep this operational issue distinct from URL reachability and verify data age honestly during acceptance.

Public DNS observations are a partial inventory. They are not sufficient to reconstruct or safely replace the zone.

## Phase 1 — capture access and rollback evidence

Completion gate: a recoverable configuration snapshot exists and the current apex target is understood.

1. Read the Cloudflare zone's actual apex, `app` and `www` record targets, proxy flags and TTLs. Export the complete zone, applicable redirect/Page/Origin Rules, Worker routes and TLS settings. Do not put account credentials or private exports in git.
2. Identify what currently owns the apex origin and whether its content needs preservation. Resolve any existing rule that would send the apex back to `app`.
3. Save both GitHub Pages API configurations, active deployment IDs, the source revision and current `CNAME`. Save deployed lab JSON/history and workflow configuration locally for continuity checks.
4. Verify `chinmayarora.com` in the owner's GitHub Pages account using GitHub's supplied TXT value. Obtain the real value from the account; retain it after verification. Check repository admin permission and Cloudflare access before scheduling the cutover.
5. Verify the existing `app` edge certificate and redirect-rule availability. Prepare the rule disabled; inspect precedence and any existing legacy-blog rules.

## Phase 2 — prepare a coordinated release

Completion gate: the portfolio, publication and lab builds all pass with apex references in isolated build outputs.

The [reference inventory](DOMAIN_MIGRATION_INVENTORY.csv) captures 280 old-host occurrences across 57 tracked files at the baseline above. It assigns review categories; it is not a replacement allowlist. Historical audit evidence is deliberately separate from active links.

- Update `CNAME`, `_config.yml`, static page metadata/JSON-LD, `robots.txt`, `llms.txt`, project/idea data and navigation references. Prefer central site configuration for generated absolute URLs. Inspect hardcoded canonicals individually.
- Update shared person/publisher schema URLs and Brain Vomit's portfolio backlinks. Keep publication canonicals, sitemap and feed on `brainvomit.blog`. Review post canonical overrides against each build's intended publication domain.
- Coordinate the **dedicated lab repository**, not just its copy in this portfolio: body API origins, navigation, canonical URLs, build defaults and the prior-snapshot fetch behavior. Export accepted history before cutover; if a first apex publish cannot retrieve it, seed from that verified export or explicitly record the gap. Do not silently claim continuous history.
- Review the portfolio assistant's canonical URL generation, fallback links, ingestion/cache identity and CORS. Source already allows both apex and old origins; `APP_SITE_URL` and fallback origin handling still reference `app`. Verify the deployed behavior with an apex Origin request. Backend implementation must follow `aegis-backend/AGENTS.md` when that work begins.
- Update active SEO tooling and its expected domains. Retain dated audit results as historical evidence. External profile and PDF résumé updates are a later explicit publication step.

Build commands, using disposable directories:

```sh
bundle exec jekyll build --destination /private/tmp/portfolio-domain-preview
bash scripts/build_brainvomit.sh /private/tmp/brainvomit-domain-preview
bundle exec ruby scripts/validate_seo_templates.rb
```

These commands must run against the prepared apex release, not merely today's unchanged source. Check the built sitemap, metadata, schemas, publication separation and linked files. Build the dedicated lab with the intended apex origin and `/live-data-lab` base path; confirm asset and snapshot paths.

## Phase 3 — domain cutover

Completion gate: apex HTTPS and all acceptance routes pass before permanent forwarding is enabled.

1. Pick a monitored window after Phase 2 passes. DNS/certificate issuance can take time; do not promise an interruption-free switch from a single Pages custom-domain binding.
2. Set the portfolio Pages custom domain to `chinmayarora.com`, then update only the relevant apex web DNS records to GitHub's currently documented targets. Re-read the official targets at execution time. Remove conflicting web targets only after saving them; preserve MX, mail TXT, verification records and unrelated hosts. Keep the apex DNS-only while obtaining its GitHub certificate.
3. Publish the prepared release. If branch publishing remains in use, account for GitHub's CNAME commit and do not merge a conflicting old CNAME afterward. If using Actions, confirm the Pages domain setting independently of the source CNAME.
4. Wait for a valid apex certificate and successful direct HTTPS; enable GitHub HTTPS enforcement when available. Do not bypass certificate errors. If proxying is restored later, validate Cloudflare-to-origin TLS as well; do not lower TLS protection to hide the existing 525.
5. Publish/verify the dedicated lab at the apex and confirm its prior data remains accessible. Only then enable the old-host redirect. If apex acceptance fails, use the rollback sequence instead.

GitHub's official guidance covers domain ownership, setting the custom domain before DNS, publishing-mode differences, DNS targets and HTTPS provisioning: [custom-domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## Old-host redirect specification

Use an existing-plan Cloudflare Single Redirect after confirming available capacity and rule precedence:

- Match only `http.host eq "app.chinmayarora.com"`.
- Dynamic destination: `concat("https://chinmayarora.com", http.request.uri.path)`.
- Preserve query string: enabled.
- During a short acceptance window, a temporary 302 can make rollback easier; promote to permanent 301 only after destination checks pass. Permanent redirects can remain cached in browsers after a rollback.
- Keep the old hostname proxied so its edge rule executes. Confirm its certificate remains valid. Do not apply this redirect to `brainvomit.blog`, API hosts, or every subdomain.
- Inspect any existing `/blog/…` migration rules. Preserve their intended Brain Vomit destinations or explicitly order a more specific exception before the catch-all; do not overwrite their behavior accidentally.

Cloudflare documents path-preserving domain redirects and the query-string option: [domain redirect example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-another-domain/), [settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/). The rule is specified here, not deployed.

## Acceptance checklist

Test HTTPS and HTTP entry points, redirect chains and final rendered content:

| Path/query | Apex result | Old-host result after final forwarding |
| --- | --- | --- |
| `/` | 200; apex canonical and social/schema URLs | 301 to apex `/` |
| `/projects/?topic=pipelines` | Filters work; apex canonical excludes tracking/filter query as designed | Path and query retained |
| `/dashboards/?view=freight` | Correct view and usable report links | Path and query retained |
| `/coursework/` and a real nested idea path | Content/assets present | Matching apex path |
| `/observatories/transit/` | Snapshot map/filter loads | Matching apex path |
| `/live-data-lab/observatories/transit/` and seismic equivalent | Assets, snapshot requests and source ages displayed correctly | Matching apex path |
| `/live-data-lab/snapshots/transit.json` | Valid accepted data; cross-origin access checked where still needed | GET redirect reaches valid JSON |
| `/sitemap.xml` and `/robots.txt` | Correct apex references | Matching apex path |
| A known legacy `/blog/…` URL | Follows intended existing publication policy | Preserved intended Brain Vomit result |

Also verify a real PDF link, encoded paths/queries, an unknown path's 404 behavior, browser console/network errors, assistant requests from the apex, and that HTTPS never loops back to `app`. Check desktop/mobile behavior once the destination is live. Compare mail records to the saved snapshot.

## Rollback and finish

If apex TLS, primary routes or lab assets fail: disable the new forwarding rule first; restore the saved Pages domain/publication configuration and only changed web DNS/rules; redeploy the pre-cutover source and lab configuration; verify `app` and mail records. Preserve the TXT ownership record unless removal is specifically required. Cached permanent redirects can outlive a revert, so retain an operational apex path where possible during recovery.

After acceptance, monitor errors and data ages through the next day. Submit the new sitemap and verify search properties; use search-provider move tools only where eligible. Update controlled profile and résumé links. Retain old-host redirects long term. This work does not move the lab to GCP/Fly or resolve the independent collector-scheduling issue by itself.
