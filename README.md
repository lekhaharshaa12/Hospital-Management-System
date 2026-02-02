# 🏥 Hospital Management System – Web Based

A simple and user-friendly **Hospital Management System** built using PHP, MySQL, HTML, and CSS.  
This project allows hospitals or clinics to manage patients, doctors, and appointments efficiently.

---

## 📌 Project Overview

The Hospital Management System is a web application that helps to manage:

- Patient records  
- Doctor details  
- Appointment bookings  
- Viewing stored information  

It is a basic CRUD-based project suitable for beginners and academic purposes.

---

## ✨ Features

### ✔ Patient Module
- Add new patients  
- View list of all patients  

### ✔ Doctor Module
- Add new doctors  
- View doctor details  

### ✔ Appointment Module
- Book appointments  
- View all appointments  

### ✔ Simple and Clean UI
- Easy navigation  
- Beginner-friendly interface  

---

## 🛠 Technologies Used

- **Frontend:** HTML, CSS  
- **Backend:** PHP  
- **Database:** MySQL  
- **Server:** XAMPP (Apache & MySQL)

---

## 📁 Project Structure
hospital-management/
│── index.html
│── style.css
│── db.php
│── add_patient.php
│── view_patients.php
│── add_doctor.php
│── view_doctors.php
│── add_appointment.php
│── view_appointments.php
│── database.sql
│── README.md


---

## 🗄 Database Details

Database Name: **hospital**

Tables used:

1. **patients**
   - id  
   - name  
   - age  
   - gender  

2. **doctors**
   - id  
   - name  
   - specialization  

3. **appointments**
   - id  
   - patient_name  
   - doctor_name  
   - date  

All table creation queries are available in:

database.sql


---

## 🚀 How to Run This Project Locally

Follow these steps carefully:

### Step 1 – Install XAMPP

Download XAMPP from:

https://www.apachefriends.org/

Install it on your system.

---

### Step 2 – Start Server

Open XAMPP Control Panel and start:

- Apache  
- MySQL  

---

### Step 3 – Place Project in htdocs

Copy the project folder into:

C:\xampp\htdocs\


Final path should be:

C:\xampp\htdocs\hospital-management



---

### Step 4 – Create Database

1. Open browser and go to:


http://localhost/phpmyadmin

2. Click on **New Database**

3. Create a database named:

hospital


4. Import the file:

database.sql


---

### Step 5 – Configure Database Connection

Open the file:

db.php


Make sure it contains:

```php
<?php
$conn = mysqli_connect("localhost", "root", "", "hospital");

if(!$conn){
    die("Connection Failed");
}
?>
Step 6 – Run the Project

Open browser and go to:

http://localhost/hospital-management


Now the project will run successfully.
