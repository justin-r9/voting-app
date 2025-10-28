# University Voting Application

This is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to facilitate secure and efficient university elections.

## Features

*   **User Authentication:** Secure registration and login for voters and administrators.
*   **Admin Dashboard:** A powerful dashboard for managing voters, candidates, and election positions.
*   **Voter Management:** Admins can add, edit, and manage eligible voters, including bulk uploads via Excel spreadsheets.
*   **Candidate Management:** Admins can add and manage candidates, including their photos and positions.
*   **Secure Voting:** Voters can view candidates and cast their votes securely.
*   **Real-time Results:** View election results and statistics.

## Tech Stack

*   **Frontend:** React
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **File Uploads:** Multer

## Getting Started

### Prerequisites

*   Node.js and npm
*   MongoDB Atlas account or a local MongoDB instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install --prefix backend
    ```

3.  **Install frontend dependencies:**
    ```bash
    npm install --prefix frontend
    ```

### Configuration

1.  **Backend Environment Variables:**
    The backend server requires a `.env` file for configuration. A template is provided in `backend/.env.example`.

    Create a `.env` file in the `backend/` directory:
    ```bash
    cp backend/.env.example backend/.env
    ```

    Update the `backend/.env` file with your specific credentials by following the structure provided in `backend/.env.example`.

## Running the Application

1.  **Start the backend server:**
    ```bash
    npm start --prefix backend
    ```
    The backend server will run on the port specified in your configuration.

2.  **Start the frontend development server:**
    ```bash
    npm start --prefix frontend
    ```
    The frontend application will be available at `http://localhost:3000`.

## Folder Structure

```
.
├── backend/         # Express.js backend
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
├── frontend/        # React frontend
│   ├── public/
│   └── src/
└── README.md
```
