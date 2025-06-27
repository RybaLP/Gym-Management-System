# 🏋️‍♂️ Gym Management System

The Gym Management System is built around a **microservices architecture**, where each service handles a specific domain. This modular approach enables better scalability, maintainability, and independent deployment. The system currently includes (but is not limited to) services responsible for:

- **Authentication & User Management** – user registration, login, JWT-based authorization.
- **Membership Management** – handling membership plans and subscriptions.
- **Booking & Room Reservation** – allowing users to book gym rooms and other facilities.

---

# 🛠 Technologies Used

- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Axios**

---

# Getting Started

Follow these steps to set up the project locally for development and testing.

##  Prerequisites

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: version 14 or higher
- **PostgreSQL**: version 12 or higher
- **npm** or **yarn** installed globally

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/RybaLP/Gym-Management-System.git
cd Gym-Management-System

# 2. Install dependencies
npm install
# or
yarn install
```

## Enviroment Variables
For each service, create .env file in main folder of service and put inside :  
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=admin
DATABASE_PASSWORD=pass
DATABASE_NAME=membership-database
JWT_SECRET="sekret"
```

auth service requires extra 2 fields : audience and issuer
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=elozelo
DATABASE_NAME=auth-database
JWT_SECRET="secret"
AUDIENCE="twoja-aplikacja.com"
ISSUER="auth-service"
```

![obraz](https://github.com/user-attachments/assets/dd0d7ba8-3e4a-4d21-90eb-34533bc3bf0f)

## Starting the Application

To launch all microservices at once, run:

```bash
npm run start:all
```
you can also run single using :
```bash
npm runstart:auth
npm run start:client
npm run start:booking
npm run start:membership
```

enjoy :)


