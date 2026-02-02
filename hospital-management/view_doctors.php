<?php
include 'db.php';

$result = mysqli_query($conn, "SELECT * FROM doctors");

echo "<h2>Doctors List</h2>";

while($row = mysqli_fetch_array($result)){
    echo $row['name']." - ".$row['specialization']."<br>";
}
?>
