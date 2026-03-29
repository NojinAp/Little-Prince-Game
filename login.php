<!--
Author: Nozhin Azarpanah
Date: March 29, 2026
Server-side Assignment
-->

<?php
    $userEmail = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
    $userBirthday = filter_input(INPUT_POST, "birthday", FILTER_SANITIZE_SPECIAL_CHARS);
    $nickname = trim(filter_input(INPUT_POST, "nickname", FILTER_SANITIZE_SPECIAL_CHARS) ?? "");
    $createUser = filter_input(INPUT_POST, "createUser");
    $errorMessage = "";

    try {
        $dbh = new PDO("mysql:host=localhost;dbname=Animation Game", "root", "");
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        die($e->getMessage());
    }

    if ($createUser) {
        if ($nickname === "") {
            $errorMessage = "Please enter your nickname.";
        } else {
            $stmt = $dbh->prepare("INSERT INTO Players (email, birthday, nickname) VALUES (?, ?, ?)");
            $stmt->execute([$userEmail, $userBirthday, $nickname]);

            header("Location: play.php?email=" . urlencode($userEmail));
            exit;
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <script>
        window.addEventListener("load", function () {
            const form = document.getElementById("nicknameForm");
            const nicknameInput = document.getElementById("nickname");
            const error = document.getElementById("error");

            if (!form) return;

            form.addEventListener("submit", function (event) {
                const nickname = nicknameInput.value.trim();

                if (nickname === "") {
                    error.textContent = "Please enter your nickname.";
                    event.preventDefault();
                    return;
                }

                error.textContent = "";
            });
        });
    </script>
    <title>Petit Prince Leap</title>
</head>
<body>
    <div id="messagePage">
        <h2 class="title">Petit Prince Leap</h2>

        <?php
        if (!$userEmail || !$userBirthday) {
            echo '<p id="messageText">Invalid input.</p>';
            echo '<div class="linkGroup">';
            echo '<a href="index.php">Go Back</a>';
            echo '</div>';
            exit;
        }

        $stmt = $dbh->prepare("SELECT * FROM Players WHERE email = ? AND birthday = ?");
        $stmt->execute([$userEmail, $userBirthday]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo '<p id="messageText">Welcome back!</p>';
            echo '<div class="linkGroup">';
            echo '<a href="play.php?email=' . urlencode($userEmail) . '">Begin</a>';
            echo '</div>';
        } else {
            $stmt = $dbh->prepare("SELECT * FROM Players WHERE email = ?");
            $stmt->execute([$userEmail]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                echo '<p id="messageText">This email is already taken.</p>';
                echo '<div class="linkGroup">';
                echo '<a href="index.php">Use a different email.</a>';
                echo '</div>';
            } else {
                echo '<p id="messageText">Welcome! Choose your nickname.</p>';

                echo '<form method="POST" action="login.php" id="nicknameForm">';
                echo '<input type="hidden" name="email" value="' . htmlspecialchars($userEmail) . '">';
                echo '<input type="hidden" name="birthday" value="' . htmlspecialchars($userBirthday) . '">';
                echo '<input type="hidden" name="createUser" value="1">';
                echo '<input type="text" name="nickname" id="nickname">';
                echo '<p id="error">' . htmlspecialchars($errorMessage) . '</p>';
                echo '<button type="submit">Begin</button>';
                echo '</form>';
            }
        }
        ?>
    </div>
</body>
</html>