# 🏥 Modern Hospital Management System

A robust, full-stack Hospital Management System designed to handle real-world clinical workflows. Built with modern web technologies, this platform features strict Role-Based Access Control, a seamless two-step pharmacy dispensary integration, and secure live-email verification flows for staff credentials.

---

## ✨ Core Features

### 🪪 Role-Based Access Control (RBAC)
Dedicated views and secured endpoints for three specialized roles:
- **Admin**: Has overarching control to manage all staff members (Adding Doctors & Receptionists), view global metrics, and override system settings.
- **Receptionist**: The backbone of the front desk. Handles patient registration, schedules appointments using the "Fast-Follow" booking flow, tracks global medicine inventory, and finalizes medicine dispensing.
- **Doctor**: Manages their own availability status, tracks incoming patient appointments, reviews patient medical histories, and generates pending prescriptions directly linked to the hospital inventory.

### 💊 Two-Step Dispensary Workflow
Protects physical inventory from virtual desynchronization:
1. **Prescription**: The Doctor prescribes medicine to the patient, deducting virtual allocations by generating a *Pending Bill*.
2. **Dispensing**: The Receptionist physically hands over the medicine to the patient at the front desk, confirming the bill and formally deducting the items from the persistent database stock.

### 🔐 Live Email Security & Zero-Config Setup
Powered by `nodemailer`, all staff are completely protected by automated 2-Factor Authentication via email. Changing localized passwords requires an instantaneous 6-digit OTP delivered strictly to the employee's registered email inbox.

**Developer Out-of-the-Box Setup:** You **do not** need real email credentials to test the core software locally! If you clone this repository and decline to populate your `.env` file, the system will automatically provision a free, temporary `Ethereal.email` test account in the background. Your console will print out a live URL to view your test emails instantly!
*(For production or real email binding, follow the `.env.example` file configuration below).*

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind/Custom CSS Glassmorphism, Framer Motion (Animations), Lucide React (Icons)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT (JSON Web Tokens), Nodemailer (SMTP Email Service)

---

## 🚀 Installation & Setup Guide

### Prerequisites
1. **Node.js**: Ensure Node.js is installed on your machine.
2. **MongoDB Database**: The system strictly depends on MongoDB. 
   - Download and install MongoDB Community Edition from the [Official MongoDB Website](https://www.mongodb.com/try/download/community).
   - Ensure the MongoDB background service is actively running on your machine (default port `27017`) before starting the server.
3. **Database Compass (Optional)**: We heavily recommend installing MongoDB Compass for a visual UI of your database collections.

### 1. Server Setup (Backend)
Navigate to the server directory:
```bash
cd hospital-management/server
npm install
```

To configure your own secure environment, securely rename the included `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(Optionally define your Gmail App Password if you want to bypass the automatic Ethereal fallback).*

Start the backend:
```bash

npm start
```
*Note: The server will automatically connect to MongoDB and seed a default Admin user (`admin@gmail.com` / `password123`).*

### 2. Client Setup (Frontend)
Open a new terminal and navigate to the client directory:
```bash
cd hospital-management/client
npm install
```

Start the Vite development server:
```bash
npm run dev -- --port 5174
```

Navigate to `http://localhost:5174` in your browser.

---

## 📖 Walkthrough / Usage Guide

1. **Initial Login**: Sign in using the default Admin schema (`admin@gmail.com` / `password123`).
2. **Hire Staff**: Navigate to the "Add Staff" tab to register your first Doctor and Receptionist.
3. **Desk Operations**: Log out and log in as the Receptionist. Register a mock patient, then immediately schedule them to an appointment with your new Doctor using the pop-up modal.
4. **Clinical Diagnosis**: Log in as the Doctor, view the patient's queue, and prescribe them a medicine. 
5. **Dispensing**: Log back in as the Receptionist, navigate to "Dispensary & Bills," and securely finalize the pending invoice to deduct your stock. 
