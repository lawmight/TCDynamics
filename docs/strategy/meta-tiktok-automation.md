# Meta & TikTok API Automation for App Traction

Your app is **published and verified**. This doc summarizes how to automate presence on **Instagram** (Meta) and **TikTok** using their official APIs, and how to use Nia-indexed sources for reference.

---

## Official APIs (use these for posting)

### Instagram (Meta)

- **Docs (indexed in Nia):** [Instagram Platform – Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- **Overview:** [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview)

**What you need**

- Instagram **professional account** (business or creator).
- App with **Instagram** product and either:
  - **Business Login for Instagram** → `graph.instagram.com`, tokens from Instagram login, or
  - **Facebook Login for Business** → `graph.facebook.com`, tokens from Facebook; account must be linked to a **Facebook Page**.
- Permissions for publishing:
  - Instagram Login: `instagram_business_basic`, `instagram_business_content_publish`
  - Facebook Login: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
- **Advanced Access** (and App Review) if your app serves accounts you don’t own.

**Publish flow**

1. **Create container** – `POST /<IG_ID>/media` with `image_url` or `video_url` (must be **public URL**), or `media_type=REELS` / `VIDEO` / `STORIES` / `CAROUSEL`.
2. For large videos: optional **resumable upload** to `rupload.facebook.com`.
3. **Publish** – `POST /<IG_ID>/media_publish` with `creation_id` = container ID.
4. Optionally **check status** – `GET /<IG_CONTAINER_ID>?fields=status_code`.
5. **Rate limit** – `GET /<IG_ID>/content_publishing_limit` to see usage; limit is **100 posts per 24h** (carousels count as one; 50 carousel posts per 24h).

**Automation**

- Host media on a public CDN or your app’s public URLs.
- In your backend: scheduled jobs (e.g. cron, queue) that at the right time:
  - create container,
  - then call `media_publish`.
- No built-in “schedule at 3pm” in the API; scheduling is your app’s responsibility.

---

### TikTok

- **Docs:** [Content Posting API – Get Started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- **Product:** [Content Posting API](https://developers.tiktok.com/products/content-posting-api/)

**What you need**

- **Registered app** on [TikTok for Developers](https://developers.tiktok.com/).
- **Content Posting API** product added; **Direct Post** configuration enabled.
- **`video.publish`** scope approved (and target user must have authorized it).
- **Audit**: unaudited apps have posts **restricted to private**; after [audit](https://developers.tiktok.com/application/content-posting-api), posts can be public.
- **Access token & open_id** for the TikTok user ([Login Kit / access tokens](https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens)).
- Video: local file or **URL from a verified domain**; photo: **URL from verified domain** (see [media transfer guide](https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide)).

**Publish flow**

1. **Query Creator Info** – `POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/`.
2. **Init post**
   - Video: `POST .../v2/post/publish/video/init/` with `source_info.source` = `FILE_UPLOAD` or `PULL_FROM_URL`.
   - Photo: `POST .../v2/post/publish/content/init/` with `post_mode`, `media_type`, etc.
3. If `FILE_UPLOAD`: **upload** file to returned `upload_url` (PUT).
4. **Poll status** – `POST .../v2/post/publish/status/fetch/` with `publish_id`.

**Automation**

- Use **PULL_FROM_URL** with videos/photos on your **verified domain** so your server only triggers the API; TikTok pulls the file.
- Run a scheduler in your app to call “init” (and if needed upload) at the desired publish time; then poll status until done.

---

## Nia: what’s indexed and how to use it

- **Meta/Instagram:**
  The Instagram API docs root is **indexed** in Nia:
  `https://developers.facebook.com/docs/instagram-api`
  After indexing finishes, use Nia **search** / **nia_read** on that documentation source for “content publishing”, “media_publish”, “rate limit”, “reels”, etc.
- **TikTok:**
  Official TikTok developer docs are **not** in Nia yet. Use the links above for implementation. For **TikTok data** (trending, hashtags, user info), the repo **`davidteather/TikTok-Api`** is indexed; it’s for **reading/scraping** only (no posting).

---

## Suggested next steps for traction

1. **Instagram**
   - In your backend, add a “scheduled post” model (e.g. time, caption, media URL, type).
   - A cron or queue job runs periodically; for each due post it calls the Instagram Content Publishing flow (create container → publish).
   - Optionally call `content_publishing_limit` to avoid hitting the 100/24h limit.
2. **TikTok**
   - Verify a domain in TikTok for Developers; host video/photo URLs there.
   - Implement Direct Post: Creator Info → init (PULL_FROM_URL) → status fetch.
   - Schedule posts in your app and run a job that triggers init at publish time.
   - Complete TikTok’s audit so posts can be public.
3. **Content and analytics**
   - Use **davidteather/TikTok-Api** (via Nia) for trending/hashtag data to inform **what** to post; use **official** Meta and TikTok APIs for **posting**.

---

## Quick links

| Resource                             | URL                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Instagram Content Publishing         | https://developers.facebook.com/docs/instagram-api/guides/content-publishing |
| Instagram Platform Overview          | https://developers.facebook.com/docs/instagram-platform/overview             |
| TikTok Content Posting – Get Started | https://developers.tiktok.com/doc/content-posting-api-get-started            |
| TikTok Content Posting API product   | https://developers.tiktok.com/products/content-posting-api/                  |
| TikTok Content Posting API audit     | https://developers.tiktok.com/application/content-posting-api                |
| TikTok API reference (direct post)   | https://developers.tiktok.com/doc/content-posting-api-reference-direct-post  |
| Nia-indexed TikTok repo (read-only)  | `davidteather/TikTok-Api` (trending, hashtags, user – no posting)            |
