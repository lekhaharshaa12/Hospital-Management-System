<?php
include 'db.php';

if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $age = $_POST['age'];
    $disease = $_POST['disease'];

    mysqli_query($conn, "INSERT INTO patients(name,age,disease) 
    VALUES('$name','$age','$disease')");

    echo "Patient Added!";
}
?>

<form method="post">
Name: <input name="name"><br>
Age: <input name="age"><br>
Disease: <input name="disease"><br>

<input type="submit" name="submit">
</form>
