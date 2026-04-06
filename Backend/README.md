# ⚙️ Bitezy - Backend API

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java 17](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=java)](https://www.oracle.com/java/)
[![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=for-the-badge&logo=apachemaven)](https://maven.apache.org/)

Robust Spring Boot RESTful API serving as the backbone for the Bitezy Food Delivery Platform.

## 🚀 API Responsibilities

- **User Management**: Authentication, Profile handling, Address storage.
- **Order Lifecycle**: Transactional logic for booking, accepting, and delivering food.
- **Partner Onboarding**: Document processing and verification (KYC).
- **Restaurant Logic**: Dynamic menu updates and order status management.
- **Analytics Engine**: aggregation of data for platform-wide reports.

## 🛠️ Getting Started

### Prerequisites

- JDK 17 or higher
- MySQL Server 8.0+
- Maven 3.9+

### Configuration

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bitezy_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### Running the Application

Using Maven:
```bash
./mvnw spring-boot:run
```

The server will start at `http://localhost:8080` (default).

## 📡 API Endpoints

- `/users/**`: Consumer related operations.
- `/admin/**`: Administrative controls.
- `/restaurants/**`: Business owner tools.
- `/delivery-partners/**`: Driver and fleet management.
- `/orders/**`: Core ordering system.

---

<p align="center">Part of the Bitezy Food Delivery Ecosystem</p>
