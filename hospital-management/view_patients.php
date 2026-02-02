<?php
include 'db.php';

$result = mysqli_query($conn, "SELECT * FROM patients");

echo "<h2>Patients List</h2>";

while($row = mysqli_fetch_array($result)){
    echo $row['name']." - ".$row['age']." - ".$row['disease']."<br>";
}
?>
