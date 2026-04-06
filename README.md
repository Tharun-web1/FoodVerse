# 🍔 Bitezy - Premium Food Delivery Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

Bitezy is a sophisticated, full-stack food delivery ecosystem designed to provide a seamless experience for customers, restaurant owners, and delivery partners. Featuring a high-fidelity interface and a robust backend, Bitezy handles everything from discovery to real-time delivery tracking.

---

## 🌟 Key Features

### 👤 User Portal
- **Smart Search & Discovery**: Find restaurants and dishes with ease.
- **Real-time Tracking**: Integrated Google Maps for live order updates.
- **Multi-language Support**: Experience the app in your preferred language (EN, HI, TE, KA, TA, ML).
- **Address Management**: Securely store and manage multiple delivery locations.

### 🏪 Restaurant Portal
- **Menu Management**: Effortlessly update dishes, prices, and availability.
- **Order Control**: Accept, process, and manage incoming orders in real-time.
- **Business Analytics**: Track sales performance and trends via interactive dashboards.
- **Document KYC**: Securely upload business licenses and tax documents (PAN, BL).

### 🛵 Delivery Partner Portal
- **Fleet Management**: Automated order assignment and routing.
- **Earnings Tracker**: Real-time view of trip-wise and daily earnings.
- **KYC Verification**: streamlined onboarding with Aadhaar and Document verification.

### 🛡️ Admin Dashboard
- **Platform Governance**: Oversight of all users, restaurants, and partners.
- **Analytics 2.0**: Deep insights into platform growth and logistics performance.
- **Coupon & Offer Management**: Tools to drive engagement via promotional campaigns.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Vite)
- **Styling**: Vanilla CSS, Bootstrap 5
- **Charts**: [Recharts](https://recharts.org/)
- **i18n**: [react-i18next](https://react.i18next.com/)
- **API Client**: Axios

### Backend
- **Core**: [Spring Boot 4.x](https://spring.io/projects/spring-boot)
- **Security**: Spring Security
- **Database**: MySQL
- **Build Tool**: Maven

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- JDK 17+
- MySQL Server 8.0+
- Google Maps API Key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/bitezy.git
   cd bitezy
   ```

2. **Frontend Setup**
   ```bash
   cd FrontEnd
   npm install
   npm run dev
   ```

3. **Backend Setup**
   - Configure your MySQL database in `Backend/src/main/resources/application.properties`.
   - Set up your Google Maps API key in the environment variables.
   ```bash
   cd Backend
   ./mvnw spring-boot:run
   ```

---

## 📐 Project Structure

```text
bitezy/
├── Backend/           # Spring Boot Application
│   ├── src/           # Java source code
│   └── pom.xml        # Maven dependencies
├── FrontEnd/          # Vite + React Application
│   ├── src/           # React components & logic
│   └── package.json   # NPM dependencies
└── README.md          # Project overview
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for more delightful dining experiences.</p>
# FoodVerse
