<?php
include 'db.php';

if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $spec = $_POST['spec'];

    mysqli_query($conn, "INSERT INTO doctors(name,specialization) 
    VALUES('$name','$spec')");

    echo "Doctor Added!";
}
?>

<form method="post">
Name: <input name="name"><br>
Specialization: <input name="spec"><br>

<input type="submit" name="submit">
</form>
