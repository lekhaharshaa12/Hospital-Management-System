<?php
include 'db.php';

if(isset($_POST['submit'])){
    $pname = $_POST['pname'];
    $dname = $_POST['dname'];
    $date = $_POST['date'];

    mysqli_query($conn, 
    "INSERT INTO appointments(patient_name,doctor_name,date)
     VALUES('$pname','$dname','$date')");

    echo "Appointment Booked!";
}
?>

<form method="post">
Patient Name: <input name="pname"><br>
Doctor Name: <input name="dname"><br>
Date: <input name="date"><br>

<input type="submit" name="submit">
</form>
