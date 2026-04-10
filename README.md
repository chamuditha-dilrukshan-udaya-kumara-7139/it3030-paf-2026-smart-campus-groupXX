# Smart Campus Application

This project has two parts:

- `backend`: Spring Boot API
- `frontend`: React web app

Run the backend first, then the frontend.

## Prerequisites

Make sure these are installed on your machine:

- `Node.js` and `npm`
- `Java JDK 25`

Notes:

- The backend uses the Maven Wrapper (`./mvnw`), so you do not need to install Maven separately.
- The frontend talks to the backend at `http://localhost:8080`.

## Project Structure

```text
.
├── backend
└── frontend
```

## How To Run

Open two terminals.

### 1. Start the backend

From the project root:

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

The backend should start on:

```text
http://localhost:8080
```

The API base URL is:

```text
http://localhost:8080/api/resources
```

### 2. Start the frontend

Open a second terminal, then run:

```bash
cd frontend
npm install
npm start
```

The frontend should open at:

```text
http://localhost:3000
```

## Database

The backend uses SQLite. The database file is created automatically when the backend starts.

Expected database file:

```text
backend/smartcampus.db
```

## First-Time Setup Summary

If you are running the project for the first time, these commands are enough:

### Terminal 1

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

### Terminal 2

```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### `zsh: permission denied: ./mvnw`

Run:

```bash
chmod +x backend/mvnw
```

Or if you are already inside the `backend` folder:

```bash
chmod +x mvnw
```

### Java version error

This project is configured to use Java 25. Check your Java version with:

```bash
java -version
```

If the version is not 25, switch your JDK and try again.

### Port already in use

If port `8080` or `3000` is already being used by another app, stop the conflicting process and restart this project.

## Useful Commands

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm test
```
