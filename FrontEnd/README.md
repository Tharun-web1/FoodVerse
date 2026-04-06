# 💻 Bitezy - FrontEend Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

React-based premium front-end for the Bitezy Food Delivery Platform.

## 🚀 Features

- **Portals**:
  - **User**: Search, Address Management, Order History, Real-time tracking.
  - **Admin**: Platform-wide user and restaurant management, Analytics.
  - **Restaurant**: Menu Management, Order Acceptance, Sales Reports.
  - **Delivery Partner**: Order collection, Trip earnings, KYC uploads.
- **Multilingual Support**: Fully translated into English, Hindi, Telugu, Kannada, Tamil, Malayalam.
- **Maps**: Integrated Google Maps for address discovery and delivery tracking.
- **Responsive**: Mobile-first design optimized for all screen sizes.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Google Maps API Key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Create a `.env` file in the root directory and add your Google Maps API key and Backend URL.
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. Run in Development mode:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   ```

## 🏗️ Folder Structure

- `src/components/User`: User portal components.
- `src/components/Admin`: Administrative control components.
- `src/components/Restaurant`: Restaurant management tools.
- `src/components/DeliveryPartner`: Driver tools and KYC.
- `src/assets/`: Shared images and styles.
- `src/i18n.js`: Localization configurations.

---

<p align="center">Part of the Bitezy Food Delivery Ecosystem</p>
