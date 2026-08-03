# App Store Connect — what to paste / confirm

Assets live in `/store` and pages in `/docs`.
Metadata for EAS: `/store.config.json`.

## URLs (after GitHub Pages is on)

- Privacy: https://ndoelger.github.io/exhausted-or-nauseous/privacy.html
- Support: https://ndoelger.github.io/exhausted-or-nauseous/support.html
- Marketing: https://ndoelger.github.io/exhausted-or-nauseous/

Enable Pages: repo Settings → Pages → Deploy from branch `main` (or `develop`) folder `/docs`.

## Screenshots to upload

Upload from:

- `store/screenshots/6.7/` → iPhone 6.7" display (1290×2796)
- `store/screenshots/6.1/` → iPhone 6.1" display (1179×2556)

Icon for listing (if asked): `store/icon/AppIcon-1024.png`

## Age rating (matches store.config.json advisory)

Answer **None** for alcohol/drugs, contests, gambling, horror, mature themes, medical, profanity, sexual content, violence.
Unrestricted web access: **No**.
Kids category: **No**.

Expected result: **4+** (or similar low rating).

## App Privacy (nutrition labels)

Data linked to identity (collected):

| Type | Purpose | Linked to identity? | Used for tracking? |
|------|---------|---------------------|--------------------|
| Phone Number | Account / Auth | Yes | No |
| Name | App functionality (profile) | Yes | No |
| User ID / Username | App functionality | Yes | No |
| Photos / Videos (optional avatar) | App functionality | Yes | No |
| Other User Content (emotion status, friend graph) | App functionality | Yes | No |
| Device ID (push token) | App functionality (notifications) | Yes | No |

Do **not** claim tracking unless you add ads/analytics SDKs that track across apps.

## Review contact

Fill real review phone in `store.config.json` → `apple.review.phone` before `eas metadata:push`.

## Push metadata to ASC

```bash
# 1) Host docs (GitHub Pages)
# 2) Fix review phone in store.config.json
eas metadata:lint
eas metadata:push
```

Screenshots still upload manually in App Store Connect (EAS Metadata does not upload screenshots yet).
