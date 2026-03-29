<?php 
/*
Author: Nozhin Azarpanah
Date: March 14, 2026
Server-side Assignment
*/
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/index.js"></script>
    <title>Petit Prince Leap</title>
</head>

<body>

<div id="formContainer">

    <h2 class="title">Petit Prince Leap</h2>

    <form method="POST" action="login.php" onsubmit="return validateEmail()">

        <label>Email Address:</label>
        <input type="text" id="email" name="email">

        <label>Birthday:</label>
        <input type="date" id="birthday" name="birthday">

        <button type="submit">Sign In</button>

    </form>

    <p id="error"></p>

</div>

</body>
</html>