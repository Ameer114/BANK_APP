# 🏦 Bank Management System

A full-stack Banking Management System built with **Java Spring Boot**, **React**, and **MySQL**.

---

## 🏗️ Architecture

```
banking-system/
├── backend/          ← Spring Boot REST API (Port 8080)
│   └── src/main/java/com/banking/
│       ├── entity/        ← JPA Entities (User, BankAccount, Transaction, Bank, BankTeller)
│       ├── repository/    ← Spring Data JPA Repositories
│       ├── service/       ← Business Logic
│       ├── controller/    ← REST Controllers
│       ├── security/      ← JWT Auth Filter & Utility
│       ├── config/        ← Spring Security Config
│       └── dto/           ← Data Transfer Objects
└── frontend/         ← React App (Port 3000)
    └── src/
        ├── pages/         ← Login, AdminDashboard, TellerDashboard, ClientDashboard
        ├── services/      ← Axios API calls
        └── context/       ← Auth Context (JWT storage)
```

---

## 👥 User Roles

| Role        | Permissions |
|-------------|-------------|
| **ADMIN**   | Manage users, banks, all accounts, view all transactions, system dashboard |
| **BANK_TELLER** | Create accounts, deposit/withdraw, view all accounts & transactions |
| **CLIENT**  | View own accounts, check balance, withdraw (with PIN), set PIN |

---

## 🗄️ Database Schema

### Tables
1. **users** — id, username, password (BCrypt), name, email, phone, role, created_at
2. **banks** — id, bank_name, address, pincode, ifsc_code
3. **bank_accounts** — id, account_number, user_id(FK), bank_id(FK), name, address, phone, pin_hash, balance, account_type, is_active, created_at
4. **transactions** — id, account_id(FK), transaction_type (DEPOSIT/WITHDRAW), amount, balance_after, description, performed_by, created_at
5. **bank_tellers** — id, user_id(FK), name, account_creation_count, created_at

---

## 🔐 API Endpoints

### Auth (Public)
```
POST /api/auth/login          → { username, password }
POST /api/auth/register       → { username, password, name, email, role }
```

### Admin (ROLE_ADMIN)
```
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
DELETE /api/admin/users/{id}
GET    /api/admin/banks
POST   /api/admin/banks
PUT    /api/admin/banks/{id}
DELETE /api/admin/banks/{id}
GET    /api/admin/accounts
DELETE /api/admin/accounts/{id}
GET    /api/admin/transactions
```

### Teller (ROLE_BANK_TELLER or ROLE_ADMIN)
```
POST   /api/teller/accounts                              ← Create bank account
GET    /api/teller/accounts
POST   /api/teller/deposit                               ← { accountNumber, amount }
POST   /api/teller/withdraw                              ← { accountNumber, amount }
GET    /api/teller/accounts/{accountNumber}/transactions
GET    /api/teller/accounts/{accountNumber}/balance
```

### Client (Authenticated)
```
GET    /api/client/accounts
GET    /api/client/accounts/{accountNumber}/balance
GET    /api/client/accounts/{accountNumber}/transactions
POST   /api/client/accounts/pin                          ← { accountNumber, newPin }
POST   /api/client/withdraw                              ← { accountNumber, amount, pin }
```

**All protected endpoints require:** `Authorization: Bearer <JWT_TOKEN>`

---

## ⚙️ Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

### 1️⃣ MySQL Setup

```sql
CREATE DATABASE banking_db;
```

---

### 2️⃣ Backend Setup

1. Navigate to `backend/` folder
2. Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   jwt.secret=your-super-secret-key-must-be-at-least-256-bits-long-for-security
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   The API starts on **http://localhost:8080**

> Tables are auto-created by Hibernate on first run (`ddl-auto=update`)

---

### 3️⃣ Frontend Setup

1. Navigate to `frontend/` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm start
   ```
   App opens at **http://localhost:3000**

---

### 4️⃣ Create First Admin User

Call the register API (e.g., via Postman or curl):

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "System Admin",
    "email": "admin@bank.com",
    "role": "ADMIN"
  }'
```

Then log in at http://localhost:3000/login

---

## 🔄 Typical Workflow

```
1. Admin logs in → Creates Bank Teller users and Banks
2. Admin/Teller logs in → Creates client accounts (with initial deposit & PIN)
3. Client logs in → Views balance, transactions, withdraws with PIN
4. Teller deposits cash to client accounts
```

---

## 🛡️ Security Features

- **BCrypt** password hashing (strength 10)
- **JWT** token authentication (24h expiry by default)
- **Role-based access control** via Spring Security `@PreAuthorize`
- **PIN verification** for client withdrawals (separate from login password)
- **CORS** configured for localhost:3000

---

## 🧰 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database  | MySQL 8, Hibernate ORM |
| Auth      | JWT (jjwt 0.11.5), BCrypt |
| Frontend  | React 18, React Router v6, Axios |
| Build     | Maven (backend), npm / Create React App (frontend) |
