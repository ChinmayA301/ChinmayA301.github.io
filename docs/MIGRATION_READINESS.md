# Migration readiness — November 13, 2026

Status: initial discovery complete. The owner selected the portfolio domain migration from app.chinmayarora.com to chinmayarora.com. The execution plan is DOMAIN_MIGRATION.md. GCP/Fly provisioning is outside this selected scope.

## Verified current state

| Component | Evidence | Consequence for migration |
| --- | --- | --- |
| Portfolio source | PR #10 merged into main as `5d32cbce1509a746c824e5355d2a6a5895c4e2fb` | Start migration changes from that revision or a verified later main revision. |
| Portfolio Pages configuration | API reports custom domain `app.chinmayarora.com`, build type `legacy`, HTTPS enforcement false | Confirm the effective publication path and direct-origin TLS before changing domain configuration. This setting alone does not establish the security of the proxied public URL. |
| Lab Pages configuration | Separate `ChinmayA301/live-data-lab` repository; workflow publishing; no repository-specific custom domain; Pages URL inherits `/live-data-lab/` on the portfolio hostname | A portfolio domain change also affects the lab's expected origin and cross-site references. |
| Free collector schedule | Workflow `snapshots.yml` active; repository Actions enabled; latest five-run query returned only the four successful push/manual deployments from the initial release | Automatic collection is unverified. Diagnose scheduler behavior and prove independent advancing observations before relying on it as the fallback during cutover. No root cause is established. |
| SQLite migration backup | Local `live-data/storage/migration-2026-11-12/verification.json` records integrity OK, no foreign-key violations, matching counts across 11 source tables and ten verified raw hashes | Recheck file hashes before use. This is dated history, not a current continuously synchronized database. |
| Portable runtime | Node server, SQLite adapter, import utility, Dockerfile and proposed Fly config exist in source | Build and acceptance gates remain necessary for an actual destination. |
| Local tool availability | `gcloud` and `flyctl` found on PATH; no `docker` executable found on PATH | Tool availability does not establish account access, billing state or deployment readiness. |

## Work that applies to either hosting destination

1. Record selected account/project, permitted monthly spend, region and which additional projects will share resources. Inspect those workloads before choosing machine size.
2. Validate the container in a build environment; run the existing tests and portable HTTP checks. Measure process memory, collection duration and disk growth using real feed samples.
3. Select a persistent SQLite disk/volume and one writer. Create an independent backup destination. Test restoration to a separate database before enabling ongoing collection.
4. Import the dated verified database if historical records are wanted. Treat the gap since that backup as missing. Start new observations at their actual collection times.
5. Run the destination alongside the snapshot site. Require at least three independent collection cycles with advancing valid source timestamps, verify map/filter behavior, restart persistence, read-only API behavior, raw replay and forecast issue/outcome clocks. Process readiness alone is insufficient.
6. Switch links and canonical/API origins only after acceptance. Record the rollback URL, source revision and database backup. Observe the new collector through the next day before retiring the fallback.

This sequence is an execution outline, not a claim that a destination or resource size has been validated. Destination-specific provisioning and rollback commands will be added after scope is selected.

## Additional work for the portfolio domain migration

Follow [DOMAIN_MIGRATION.md](DOMAIN_MIGRATION.md), with these dependencies made explicit:

- Inspect the apex's existing website, DNS, mail records and unrelated subdomains; save current records before any edits.
- Verify GitHub domain ownership and certificate readiness, and confirm whether Pages publishing is controlled by the legacy configuration or the checked-in deployment workflow.
- Update the dedicated lab's origin references and previous-snapshot fetch URL behavior as part of the same release. Preserve its `/live-data-lab/` path unless deliberately replaced.
- Verify permanent old-host redirects preserve nested paths and query strings for both the portfolio and the lab, without loops. Keep Brain Vomit and unrelated API hosts on their intended domains.

## Selected scope

Proceed with the portfolio domain migration plan. Execution requires the authenticated DNS inventory, ownership verification and access checks described in that plan. Existing plans remain [lab hosting](../live-data/MIGRATION.md) and [portfolio domain](DOMAIN_MIGRATION.md).
