# App Privacy nutrition labels — exact App Store Connect answers

Path in ASC: **App Privacy** → **Get Started** / **Edit** → **Data Collection**

## Start
- **Do you or your third-party partners collect data from this app?** → **Yes**

## Data types to add

### Contact Info
**Phone Number**
- Collected: Yes
- Purposes: **App Functionality** (also fine to select **Account Management** if shown)
- Linked to user identity: **Yes**
- Used for tracking: **No**

**Name** (first name / last initial)
- Collected: Yes
- Purposes: **App Functionality**
- Linked: **Yes**
- Tracking: **No**

### Identifiers
**User ID** (account id / username)
- Collected: Yes
- Purposes: **App Functionality**
- Linked: **Yes**
- Tracking: **No**

**Device ID** (Expo push token)
- Collected: Yes
- Purposes: **App Functionality**
- Linked: **Yes**
- Tracking: **No**

### User Content
**Photos or Videos** (optional profile photo)
- Collected: Yes (optional)
- Purposes: **App Functionality**
- Linked: **Yes**
- Tracking: **No**

**Other User Content** (emotion/status, friend requests)
- Collected: Yes
- Purposes: **App Functionality**
- Linked: **Yes**
- Tracking: **No**

## Do NOT add (unless you add those SDKs later)
- Advertising Data
- Purchase History
- Location
- Contacts
- Diagnostics / Crash (unless you ship a crash reporter)
- Tracking = Yes for anything

## Third parties
You use Supabase (auth/DB/storage) and Expo push. In Apple’s model you still declare the data **you** collect via the app; you typically do **not** mark “tracking” for these.

## Privacy Policy URL (App Information)

Paste this into **App Information → Privacy Policy URL**:

```
https://ndoelger.github.io/exhausted-or-nauseous/privacy.html
```

Support URL (version page):

```
https://ndoelger.github.io/exhausted-or-nauseous/support.html
```
