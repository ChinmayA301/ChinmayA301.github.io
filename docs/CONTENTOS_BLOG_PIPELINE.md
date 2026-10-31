# Brain Vomit → ContentOS

The Brain Vomit Cloudflare build now emits `/api/posts.json` plus a public evidence JSON file for each rendered article. Each entry contains title, canonical URL, summary, tags, publication time, content type, source filename, evidence URL and a SHA-256 revision hash. The hash binds metadata and rendered article text; it never hashes raw private front matter. Unpublished/future articles excluded by Jekyll are not cataloged. Only the standalone Brain Vomit build emits this API; the portfolio build is unchanged.

The `Notify ContentOS of published blog posts` GitHub workflow runs on main changes under `_posts/`. It builds the expected revision, waits up to 20 minutes for the matching production catalog/evidence/page marker and canonical URL, then sends `blog.post.published` to the configured HTTPS receiver. It refuses redirects and retries transient sends with the same event identity and fresh HMAC timestamp. Deletions and unpublished posts produce no event. Rapid pushes can run independently; receiver idempotency handles retries. A superseded article revision may fail verification rather than announce stale content. There is no archive backfill by default.

Configure these repository values (the integration setup does this without committing credentials):

- Actions variable `CONTENTOS_BLOG_WEBHOOK_URL`: `https://contentos-meta-connect.chinmayarora30.workers.dev/v1/blog/events`
- Actions secret `CONTENTOS_BLOG_WEBHOOK_SECRET`: same private signing value as Worker `BLOG_WEBHOOK_SECRET`.

The workflow has Contents read permission only; it cannot publish articles or modify the repository. ContentOS's runtime needs no GitHub or website administration token. The receiver grants the signing secret only event-submission access; admin polling uses a different credential.

The signed input is limited to 16 KiB; signatures cover `timestamp + '.' + exact UTF-8 request body` using HMAC-SHA256. Headers are `X-ContentOS-Timestamp` (Unix seconds) and `X-ContentOS-Signature` (`sha256=` plus hex). Timestamps must be within five minutes. Events are deduplicated by canonical URL plus revision hash, and reuse with different metadata returns 409. No approval, scheduling or social publishing happens in this workflow.

An explicit single-article smoke test or recovery is available through Actions → Notify ContentOS → Run workflow → one `_posts/filename.md` on main. Repeating it is safe. For site build failures, inspect the Cloudflare deployment first; no event is sent for an unverified revision. For event failures, rerun the workflow after resolving the cause. Future-dated posts require a later site rebuild and explicit dispatch if no new commit changes their file.
