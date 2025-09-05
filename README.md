# Payroll Management System

A **full-stack web application** to manage employees, salaries, tax computation, and payslips.  
Built with **React (frontend)**, **Node.js/Express (backend)**, and **Sequelize ORM** with **MySQL database**.

---

## ✨ Features
- 🔐 User Authentication (JWT-based)
- 👨‍💼 Admin Panel for managing employees
- 💰 Salary & Tax Computation
- 📄 Payslip Generation
- 📧 Email Notifications (using Nodemailer)
- 🎨 Responsive UI with Bootsrap
- 🗄️ Database models handled with Sequelize ORM

---

## 🛠️ Tech Stack
**Frontend:**
- React.js
- Bootstrap

**Backend:**
- Node.js / Express.js
- Sequelize ORM
- JWT Authentication
- Nodemailer

**Database:**
- MySQL (default)  
  

---

## 📂 Project Structure
payroll-management-system/
├── backend/ # Express.js + Sequelize + MySQL
│ ├── config/ # Database configuration
│ ├── controllers/ # Business logic
│ ├── middleware/ # Auth, error handling
│ ├── models/ # Sequelize models
│ ├── routes/ # Express routes
│ ├── server.js # Entry point
│ └── package.json
├── frontend/ # React.js + Bootstrap
│ ├── src/
│ ├── public/
│ ├── package.json
└── README.md

yaml
Copy code

---

## ⚙️ Installation & Setup (Local)

### 1. Clone repository
```bash
git clone https://github.com/your-username/payroll-management-system.git
cd payroll-management-system
2. Backend Setup
bash
Copy code
cd backend
npm install
Create a .env file inside backend/:

env
Copy code
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=payroll_db
JWT_SECRET=supersecretkey
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-app-password
FRONTEND_URL=http://localhost:3000

Run the backend:

npm start
Backend runs on: http://localhost:5000

3. Frontend Setup


cd ../frontend
npm install
Create .env in frontend/:

env

REACT_APP_API_URL=http://localhost:5000

Run the frontend:

Copy code
npm start
Frontend runs on: http://localhost:3000

🔐 Environment Variables
Variable	Description	Required
PORT	Backend port	✅
DB_HOST	Database host	✅
DB_PORT	Database port	✅
DB_USER	Database user	✅
DB_PASSWORD	Database password	✅
DB_NAME	Database name	✅
JWT_SECRET	JWT signing key	✅
EMAIL_USER	SMTP user	Optional
EMAIL_PASS	SMTP password	Optional
FRONTEND_URL	Allowed frontend URL for CORS	✅
REACT_APP_API_URL	Frontend → Backend API endpoint	✅



Example SQL Queries
-- Insert an Admin user
INSERT INTO users (name, email, password, role, department, status, createdAt, updatedAt)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$D9eDg8fUPkFZ6vlqH7sE6eRkByoXJcXrI6OiC9UFlCeWwT0b5Nc82', -- bcrypt hash for "admin123"
  'admin',
  'HR',
  'active',
  NOW(),
  NOW()
);

-- Insert an Employee user
INSERT INTO users (name, email, password, role, department, status, createdAt, updatedAt)
VALUES (
  'John Employee',
  'john@example.com',
  '$2a$10$YjW7YuzIuXf6iUkCC.7J2OwhLrQjE3a8xM7vDTcQZg0Ph6rxRhQ8u', -- bcrypt hash for "employee123"
  'employee',
  'Finance',
  'active',
  NOW(),
  NOW()
);


✅ Default Login Credentials (for testing):

Admin → admin@example.com / admin123

Employee → john@example.com / employee123
