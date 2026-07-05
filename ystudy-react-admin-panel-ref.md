# Y-Study React Admin Panel Developer Reference

This document summarizes the structure, routing, and configurations of the **Y-Study React Admin Panel** to avoid parsing the entire codebase in future runs.

## 📂 Project Directory Structure

```text
ystudy-react-admin-panel/
├── src/
│   ├── components/            # Reusable page components & modals
│   │   ├── layout/            # DashboardLayout shell
│   │   ├── BannerAdminPanel   # Banner layout visual builder
│   │   ├── CourseAdminPanel   # Course entry requirements & relations editor
│   │   └── ...
│   ├── context/               # AuthContext for session management
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # List view modules and primary routing endpoints
│   ├── utils/                 # API connection configurations & crypto helpers
│   │   ├── api.ts             # Axios initialization with token attachment
│   │   ├── crypto.ts          # AES-256 CBC encryption/decryption utilities
│   │   └── ...
│   ├── App.tsx                # React Router root definitions
│   └── main.tsx               # Client entrypoint mounting App
```

---

## 🛠️ API & Security Design

Communication with the backend endpoints (hosted under `http://localhost:4000/api` or `VITE_API_URL`) is secured. Data payloads are encrypted using **AES-256-CBC** with zero IV padding.

- **Axios Instance**: `src/utils/api.ts` attaches `Authorization: Bearer <token>` automatically.
- **Crypto Utilities**: `src/utils/crypto.ts` exports `encrypt(payload)` and `decrypt(encryptedString)`.
- **Encryption Workflow**:
  - Request: Payload body is wrapped as `{ data: encrypt(payload) }`.
  - Response: Handled as `decrypt(response.data)`.
  - *Exception*: Certain simple listings or Next.js public consumption points do not require encryption.

---

## 🛣️ Routing Manifest

Defined inside [App.tsx](file:///E:/projects/y-study/git/ystudy-react-admin-panel/src/App.tsx), all routes except `/login` are wrapped inside the `ProtectedRoute` and `DashboardLayout` elements:

| Path | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Credentials validation, saves Bearer token. |
| `/media` | `MediaPage` / `MediaGallery` | Uploading assets and browsing folders. |
| `/banners` | `BannerListPage` | List available website homepage banners. |
| `/banners/new` / `/banners/edit/:id` | `BannerAdminPanel` | Live visual builder for banner blocks. |
| `/courses` | `CourseListPage` | List curriculum degree programs. |
| `/courses/new` / `/courses/edit/:id` | `CourseAdminPanel` | Edit degree details and links. |
| `/locations` | `LocationListPage` | List campuses. |
| `/locations/new` / `/locations/edit/:id` | `LocationAdminPanel` | Form for campus details & cover image. |
| `/faqs` | `FAQListPage` | List FAQ categories. |
| `/faqs/new` / `/faqs/edit/:slug` | `FAQAdminPanel` | Categories/questions dynamic list editor. |
| `/time-tables` | `TimeTableListPage` | List time tables. |
| `/time-tables/new` / `/time-tables/edit/:id` | `TimeTableAdminPanel` | Timetable study-pattern row builder. |
| `/recycle-bin` | `RecycleBinPage` | View deleted documents and restore/wipe them. |

---

## 🚀 Running Locally

- Start the development server using: `npm run dev`
- Production builds: `npm run build`
