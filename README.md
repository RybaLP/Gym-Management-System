Project Overview

The Gym Management System is built around a microservices architecture, where each service handles a specific domain. This approach allows for better scalability, maintainability, and independent deployment of components. The system currently includes (but is not limited to) services responsible for:





Authentication & User Management: Handling user registration, login, and authorization.



Membership Management: Managing different types of user memberships (e.g., Standard, Platinum).



Booking & Room Reservation: Allowing users to book and reserve various gym rooms/facilities.


Technologies Used


NestJS: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.



TypeORM: An ORM (Object-Relational Mapper) that runs in Node.js, allowing you to work with your database using TypeScript/JavaScript classes.



PostgreSQL: A powerful, open-source object-relational database system.



Axios / HttpService (NestJS): For inter-service communication (making HTTP requests between microservices).



Class-validator & Class-transformer: For robust request body validation.



Getting Started

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps.

Prerequisites





Node.js (LTS version recommended)



npm or Yarn (preferred package manager)



PostgreSQL database instance running locally (or accessible remotely). Ensure your .env files for each microservice are configured with correct database connection strings.

Installation





Clone the repository:

git clone [Your Repository URL Here]
cd gym-management-system



Install dependencies: Navigate to the root of the project and install all necessary packages for the monorepo:

npm install
# or
yarn install


Running the Microservices

The project is structured as a monorepo, allowing you to run individual microservices or all of them concurrently.

Individual Microservice Startup

To run a specific microservice, use the following commands. Each service will typically run on a different port as specified in its configuration (e.g., .env file).





Authentication Service:

npm run start:auth
# Running on http://localhost:3001 (example port)



Membership Service:

npm run start:membership
# Running on http://localhost:3002 (example port)



Booking Service:

npm run start:booking
# Running on http://localhost:3003 (example port)

(Add other services if you have them, e.g., start:payment)

Note: The exact ports (e.g., 3001, 3002, 3003) depend on your .env configuration for each service.

Running All Microservices Concurrently

For convenience during development, you can start all microservices at once using a single command:

npm run start:all

This command will likely use a tool like concurrently or a similar solution configured in your package.json to manage multiple nest start processes.



Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.



📄 License

This project is licensed under the MIT License - see the LICENSE file for details (if you have one).
