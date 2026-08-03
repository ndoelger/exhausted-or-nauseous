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

Full click-by-click answers: `store/APP_PRIVACY.md`

Short version — collect **Yes**, tracking **No** for all of these:

| Type | Purpose | Linked? | Tracking? |
|------|---------|---------|-----------|
| Phone Number | App Functionality | Yes | No |
| Name | App Functionality | Yes | No |
| User ID | App Functionality | Yes | No |
| Photos or Videos | App Functionality | Yes | No |
| Other User Content | App Functionality | Yes | No |
| Device ID | App Functionality | Yes | No |

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
