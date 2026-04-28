# Document Search Application

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/document-search-app.git
cd document-search-app
```

---

### 2. Run MongoDB using Docker
 Start MongoDB using Docker

 a docker-compose.yml file is already provided in the backend folder, you can start MongoDB with:

cd backend
docker-compose up -d

This will start the required services (MongoDB) in the background.

---

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=mongodb://admin:password@localhost:27017/docsearch?authSource=admin
PORT=5000
```

---

### 4. Run backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000

---

### 5. Run frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

---

## Features

* Upload PDF, DOCX, and TXT files
* Extract and store document content
* Search documents using full-text search
* View document details

---

## Tech Stack

* React (TypeScript)
* Node.js / Express
* MongoDB (Docker)
