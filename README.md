![Vocean Technologies](Voceantechnologies.png)

# Y Study - Admin Control Panel

A modern, high-performance, and secure Content Management & Administrative Console built with **React**, **TypeScript**, and **Vite**. This dashboard provides the Y Study administrative team with a powerful interface to manage media assets, homepage banners, navigations, custom CMS page templates, and the courses curriculum database.

---

## 🚀 Key Features

### 1. 🎓 Course Management System

- **Full Curriculum Editing**: Add, update, and review course catalogs, program entry specifications, and descriptions.
- **Automated Slug Generation**: Auto-generates clean, SEO-friendly URL paths from course titles as you type.
- **Outcomes & Attributes**: Manage graduate salary expectations (`from`/`to` yearly ranges) and career outcome tag tags.
- **Inter-Course Relationships**: Easily link program pathways using visual checklists to assign **Available Courses** and **Related Courses** recommendations.
- **Media Binding**: Seamlessly select and link cover banner graphics from the built-in Media Library.

### 2. ⏳ Inactivity Warning & Secure Auto-Logout

- **Security Protocols**: Monitors user session activity (mouse movement, scroll, clicks, touch, and keystrokes).
- **Graceful Warning Modal**: Automatically triggers a glassmorphic warning countdown modal **5 minutes** prior to session expiration.
- **Adaptive Fallback**: If the configured idle time is short (e.g. for testing purposes, $\le$ 5 minutes), the warning displays at 80% elapsed time.
- **Forced Action**: Blocks background actions while active; user must click **Stay Logged In** or **Log Out** to ensure security against walk-away exposure.

### 3. 🖼️ Media Library & Gallery

- **Asset Hub**: Upload, explore, search, and manage files in nested folder hierarchies.
- **Modal Media Picker**: Integrated modal selectors embedded inside form builders (Banners, Courses, CMS Pages) to link files instantly.

### 4. 📢 Interactive Banner Builder

- **Visual Editor**: Customize headlines, taglines, layouts, and data points.
- **Live Preview Visualizer**: Real-time rendering of stacked layouts, grids, highlight statistics, and listings.

### 5. 📑 CMS Pages & Accordion Layout Editor

- **Dynamic Content Bindings**: Modify layout JSON structures page-by-page.
- **Accordion Form Fields**: Section-based, modular fields toggle open/closed to reduce form clutter.

### 6. 🌐 Navigation Manager

- **Dynamic Layouts**: Easily reorder and build tree-structured menus for header/footer routing.

### 7. 🔒 Encrypted Data Transport

- **AES Payload Encryption**: Protects sensitive payload parameters using CryptoJS before transmitting them to the backend, aligning with backend routing decryption middlewares.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) (fast HMR dev environment)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router Dom v7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security**: [CryptoJS](https://github.com/brix/crypto-js)
- **Formatting & Linter**: [Oxlint](https://oxc.rs/docs/guide/usage/linter/rules)

---

## 📁 Directory Structure

```text
src/
├── assets/          # Static logos and global styles
├── components/      # UI components (BannerAdminPanel, CourseAdminPanel, MediaPickerModal, etc.)
│   └── layout/      # Shell templates (DashboardLayout)
├── context/         # Auth & global state management (AuthContext)
├── hooks/           # Custom React hooks (useIdleLogout)
├── pages/           # Base Route page views (CourseListPage, LoginPage, MediaPage, etc.)
├── utils/           # Encryption helper, Axios instance, API services
├── App.tsx          # Router configuration and guards
└── main.tsx         # App bootstrap entrypoint
```

---

## ⚙️ Getting Started

### 📋 Prerequisites

Ensure you have Node.js (version 18+ recommended) and a package manager installed.

### 📥 Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd ystudy-react-admin-panel
   ```
2. Install the node modules:
   ```bash
   npm install
   ```

### 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:4000/api
VITE_CRYPTO_SECRET_KEY=your_aes_secret_key_here
VITE_PUBLIC_DOMAIN=https://y-study.co.uk
```

### 💻 Running the App

- Run the local development server:
  ```bash
  npm run dev
  ```
- Build the optimized production bundle:
  ```bash
  npm run build
  ```
- Preview the built production version locally:
  ```bash
  npm run preview
  ```

---

## 📄 License

This project is proprietary and for internal administrative use only.
