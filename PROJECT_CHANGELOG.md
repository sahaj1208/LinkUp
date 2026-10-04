# LinkUp Project Upgrade

This version keeps the existing Stream-based chat/video architecture and upgrades the application around it instead of rebuilding the project from scratch.

## What changed

### Backend
- Rebranded environment/configuration from the old `STEAM_*` typo to `STREAM_*`.
- Added configurable `FRONTEND_URL` and `VITE_API_URL` support for development/production environments.
- Added `/api/health` health-check endpoint.
- Server now connects to MongoDB before accepting traffic and supports graceful shutdown.
- Added centralized 404/error responses and disabled Express `X-Powered-By`.
- Strengthened JWT authentication handling with proper 401 responses for invalid/expired tokens.
- Normalized emails and improved signup validation.
- Password field is excluded from normal user queries and only selected for login.
- Onboarding now updates an allow-listed set of profile fields instead of accepting arbitrary request properties.
- Added friend-request rejection and basic request indexes/validation.
- Added ObjectId validation and cleaner API errors.

### Frontend
- Rebranded the UI from Streamify to **LinkUp**.
- Added a working `/friends` route and dedicated friends/search page.
- Added search/filtering across people and friends by name, language, and location.
- Added accept/reject friend-request actions with toast feedback.
- Added safer API error messages instead of reading nested error properties directly.
- Added loading/error handling and cleanup for Stream Chat and Stream Video clients.
- Fixed the video-call token initialization edge case and navigation side-effect.
- Added the missing `CameraIcon` import in onboarding.
- Added a generated call link flow with unique call IDs per call attempt.
- Improved responsive chat styling and theme persistence under the LinkUp key.
- Updated page metadata, documentation, and environment examples.

## Verified source-level checks

- All backend `.js` files pass `node --check`.
- Frontend dependency installation/build could not be completed in the working container because the package download timed out; the source was reviewed and patched manually.

## Resume alignment note

The current implementation uses **Stream Chat** for real-time messaging and **Stream Video** for calls. It does not currently implement Socket.IO messaging. For an accurate resume, the LinkUp bullet should therefore say Stream Chat rather than claiming Socket.IO-based messaging unless Socket.IO is added in a future iteration.

## Latest UI and notifications update
- Added a persistent Stream Chat notification session for unread message tracking.
- Added unread message badges to the global Messages action and per-friend Message buttons.
- Added friend-request/accepted-connection notification badges to the navbar, sidebar, and home page.
- Notifications are marked as seen when the Notifications page is opened.
- Added a Back button to the chat screen.
- Chat conversations are marked as read when opened.
- Added reusable profile-avatar fallback initials to avoid broken image placeholders.


## 2026-10-04 - Profile Editing & Presence

- Added authenticated profile settings at `/profile` with editable name, bio, languages, location, and avatar.
- Added profile access from the navbar and desktop sidebar.
- Added server-backed presence heartbeats with a one-minute freshness window.
- Friend and discovery cards now show actual online/offline status instead of a static green indicator.
- Added logout presence handling so explicit logout marks the user offline immediately.
- Friend and discovery lists refresh periodically so presence changes appear without a manual reload.
