# DASH CRM — Full Stack Web Application

A polished, production-ready full stack CRM dashboard built with React.js, Node.js, Express, and MySQL.

---

## ✨ Features

- **Login Page** — Email/password auth with full form validation, error messages, and JWT-based sessions
- **Dashboard** — Overview stats, Leads table, Tasks list, Team Members grid
- **Protected Routes** — Unauthenticated users are redirected to login
- **Logout** — Clears token from localStorage and redirects to login
- **Responsive UI** — Works on desktop and mobile
- **REST API** — Secured endpoints with Bearer token auth

---

## 🛠 Tech Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | React.js, React Router v6, Axios |
| Backend   | Node.js, Express.js         |
| Database  | MySQL + Sequelize           |
| Auth      | JWT (jsonwebtoken) + bcrypt password hashing |
| Styling   | Pure CSS (no UI library)    |

---

## 📁 Project Structure

```
fullstack-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL Sequelize connection
│   │   ├── middleware/auth.js    # JWT protect middleware
│   │   ├── models/User.js        # Sequelize User model
│   │   ├── routes/auth.js        # Login, /me, seed routes
│   │   ├── routes/dashboard.js   # Stats, leads, tasks, users
│   │   ├── init.js               # Database creation & seeding script
│   │   └── server.js             # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── context/AuthContext.js  # Auth state + login/logout
    │   ├── services/api.js         # Axios dashboard API calls
    │   ├── pages/
    │   │   ├── LoginPage.jsx + .css
    │   │   └── DashboardPage.jsx + .css
    │   ├── App.jsx                 # Router + private/public routes
    │   ├── main.jsx
    │   └── index.css               # Global design tokens
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL Server running locally (e.g., via XAMPP)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/patel-crm.git
cd patel-crm
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL connection matching your local database:

```
PORT=5001
DB_NAME=crm_dashboard
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
JWT_SECRET=your_super_secret_key_here
ADMIN_EMAIL=admin@crm.com
ADMIN_PASSWORD=Admin@123
```

Initialize the Database and tables, and seed the admin user by running the setup script:

```bash
node src/init.js
```

Start the backend:

```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

The server runs at **http://localhost:5001**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The app typically runs at **http://localhost:5173** (or 3000 depending on your Vite config).

> The frontend typically proxies `/api` requests or connects directly to `http://localhost:5001` based on your API settings.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint          | Auth | Description               |
|--------|-------------------|------|---------------------------|
| POST   | `/api/auth/login` | No   | Login with email+password |
| GET    | `/api/auth/me`    | Yes  | Get current user          |
| POST   | `/api/auth/seed`  | No   | Create demo user          |

### Dashboard
| Method | Endpoint               | Auth | Description   |
|--------|------------------------|------|---------------|
| GET    | `/api/dashboard/stats` | Yes  | Summary stats |

### Leads
| Method | Endpoint                     | Auth | Description       |
|--------|------------------------------|------|-------------------|
| GET    | `/api/dashboard/leads`       | Yes  | Get all leads     |
| POST   | `/api/dashboard/leads`       | Yes  | Create a new lead |
| PUT    | `/api/dashboard/leads/:id`   | Yes  | Update a lead     |
| DELETE | `/api/dashboard/leads/:id`   | Yes  | Delete a lead     |

### Tasks
| Method | Endpoint                     | Auth | Description       |
|--------|------------------------------|------|-------------------|
| GET    | `/api/dashboard/tasks`       | Yes  | Get all tasks     |
| POST   | `/api/dashboard/tasks`       | Yes  | Create a new task |
| PUT    | `/api/dashboard/tasks/:id`   | Yes  | Update a task     |
| DELETE | `/api/dashboard/tasks/:id`   | Yes  | Delete a task     |

### Users
| Method | Endpoint                     | Auth | Description       |
|--------|------------------------------|------|-------------------|
| GET    | `/api/dashboard/users`       | Yes  | Get all users     |
| POST   | `/api/dashboard/users`       | Yes  | Create a new user |
| PUT    | `/api/dashboard/users/:id`   | Yes  | Update a user     |
| DELETE | `/api/dashboard/users/:id`   | Yes  | Delete a user     |
---

## 🔐 Login Credentials (Demo)

After running the `init.js` setup script, the default Super Admin is:

```
Email:    admin@crm.com
Password: Admin@123
```

*(You can also use the `/api/auth/seed` endpoint to create the standard `demo@crm.com` user).*
> Passwords are hashed using bcrypt before storage.
---

## 📝 License

MIT
