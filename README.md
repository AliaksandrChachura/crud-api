# CRUD-API

## Description

This is a CRUD (Create, Read, Update, Delete) API project.

## Installation

1. Clone the repository: `git clone <repository-url>`
2. Install the required dependencies by running `npm install`

## Usage

1. Start the server by running one of the commands:

- Development mode: `npm run start:dev`
- Production mode: `npm run start:prod`
- Multi-instance mode: `npm run start:multi`

2. Access the API endpoints using a tool like Postman or cURL.

## API Endpoints

- `GET /api/users`: Retrieve all users.
- `GET /api/users/:id`: Retrieve a specific user by ID.
- `POST /api/users`: Create a new user.
- `PUT /api/users/:id`: Update a specific user by ID.
- `DELETE /api/users/:id`: Delete a specific user by ID.

## Scripts

- Check code formatting: `npm run prettier:check`
- Format code: `npm run prettier:write`
- Run linting: `npm run lint`
- Run tests: `npm run test`

## Technologies Used

- Node.js
