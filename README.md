# Project Overview

The Gym Management System is built around a microservices architecture, where each service handles a specific domain. This approach allows for better scalability, maintainability, and independent deployment of components. The system currently includes (but is not limited to) services responsible for:

- **Authentication & User Management**: Handling user registration, login, and authorization.
- **Membership Management**: Managing different types of user memberships (e.g., Standard, Platinum).
- **Booking & Room Reservation**: Allowing users to book and reserve various gym rooms/facilities.

---

# 🛠 Technologies Used

- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Axios
---

# Getting Started

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps.

## Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **Yarn** (preferred package manager)
- **PostgreSQL** database instance running locally (or accessible remotely). Ensure your `.env` files for each microservice are configured with correct database connection strings.

## Installation

1. **Clone the repository**:
   ```bash
git clone https://github.com/RybaLP/Gym-Management-System.git
npm install
# or
yarn install







