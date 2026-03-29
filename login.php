<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <title>Petit Prince Leap</title>
</head>
<body>
    <div id="messagePage">
        <h2 class="title">Petit Prince Leap</h2>

        <?php

            $userEmail = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
            $userBirthday = filter_input(INPUT_POST, "birthday", FILTER_SANITIZE_SPECIAL_CHARS);

            try {
                $dbh = new PDO("mysql:host=localhost;dbname=Animation Game", "root", "");
                $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (Exception $e) {
                die($e->getMessage());
            }

            $stmt = $dbh->prepare("SELECT * FROM Players WHERE email = ? AND birthday = ?");
            $stmt->execute([$userEmail, $userBirthday]);
            $row = $stmt->fetch();
            if ($row) {
            echo '<p id="messageText">Welcome back!</p>';
            echo '<div class="linkGroup">';
            echo '<a href="play.php?email=' . urlencode($userEmail) . '">Begin</a>';
            echo '</div>';
            }
            else {
                $stmt = $dbh->prepare("SELECT * FROM Players WHERE email = ?");
                $stmt->execute([$userEmail]);
                $row = $stmt->fetch();

                if ($row) {
                    echo '<p id="messageText">This email is already taken.</p>';
                    echo '<div class="linkGroup">';
                    echo '<a href="index.php">Use a different email.</a>';
                    echo '</div>';
                }
                else {
                    $stmt = $dbh->prepare("INSERT INTO Players (email, birthday) VALUES (?, ?)");
                    $stmt->execute([$userEmail, $userBirthday]);
                    echo '<p id="messageText">Welcome to the game!</p>';
                    echo '<div class="linkGroup">';
                    echo '<a href="play.php?email=' . urlencode($userEmail) . '">Begin</a>';
                    echo '</div>';
                }
            }

        ?>

    </div>
</body>
</html>