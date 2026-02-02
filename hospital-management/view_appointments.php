<?php
include 'db.php';

$result = mysqli_query($conn, "SELECT * FROM appointments");

echo "<h2>Appointments</h2>";

while($row = mysqli_fetch_array($result)){
    echo $row['patient_name']." - ".
         $row['doctor_name']." - ".
         $row['date']."<br>";
}
?>
