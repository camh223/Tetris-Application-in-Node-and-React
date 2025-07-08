# Tetris Web Application in React and Node.js

A modern, full-stack Tetris clone built with React, Node.js, and MongoDB.

This application allows users to play Tetris, compete on a global leaderboard, and securely create accounts using JWT-based authentication.

# Project Structure

```sh
.
├── public/                 # Static files
├── src/                   # Frontend source code (React)
│   ├── api/               # Axios or API helper modules
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth / global state
│   ├── pages/             # Page-level components (Login Game, etc.)
│   ├── App.jsx
│   └── index.js
├── server/                # Backend API (Express)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route handlers
│   └── server.js          # Express app entry point
├── package.json           # Root dependencies (frontend)
└── README.md
```


# Local Development Setup

## Clone the Repository

```sh
git clone https://github.com/camh223/Tetris-Application-in-Node-and-React.git
```

```sh
cd Tetris-Application-in-Node-and-React
```

## Set up Environment Variables

Create a `.env` file in the `/server` directory:

```sh
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

## Install Dependencies

Frontend:

```sh
# In project root

npm install 
```

Backend:

```sh
cd server
npm install
```

## Run the App:

In one terminal, start the backend:

```sh
cd server
npm run dev
```

In another terminal, start the frontend:

```sh
# In project root

npm start
```

Visit the app at: http://localhost:3000

# License

This project is licensed under the MIT License.



