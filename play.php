<!--
Author: Nozhin Azarpanah
Date: March 29, 2026
Server-side Assignment
-->

<?php
    $userEmail = filter_input(INPUT_GET, "email", FILTER_VALIDATE_EMAIL);
    if (!$userEmail) {
    ?>
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
            <p id="messageText">Session expired or invalid access.</p>
            <div class="linkGroup">
                <a href="index.php">Sign In Again</a>
            </div>
        </div>
    </body>
    </html>
<?php
    exit;
}

try {
    $dbh = new PDO("mysql:host=localhost;dbname=azarpann_db", "azarpann_local", "W{u94OMW");
} catch(Exception $e) {
    die ($e->getMessage());
}

$stmt = $dbh->prepare("SELECT MAX(score) AS bestScore FROM Results WHERE email = ?");
$stmt->execute([$userEmail]);
$row = $stmt->fetch();

$userBestScore = 0;

if ($row && $row["bestScore"] !== null) {
    $userBestScore = (int)$row["bestScore"];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
    <script>
        const currentUserEmail = <?php echo json_encode($userEmail); ?>;
        const databaseHighScore = <?php echo json_encode($userBestScore); ?>;
    </script>
    <script src="js/script.js"></script>
    <title>Petit Prince Leap</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="startPage">
        <h2 class="title">Petit Prince Leap</h2>
        <button id="startButton">Play</button>

        <details id="helpToggle">
            <summary>?</summary>
            <div id="helpPanel">
                <h3>How to Play</h3>
                <p>Desktop: Use Left/Right arrow keys.</p>
                <p>Mobile: Tilt your phone to move.</p>
                <p>Land on platforms and climb higher to increase score.</p>
                <p>Tap || to pause, then Resume to continue.</p>
            </div>
        </details>
    </div>

    <canvas id="gameCanvas" width="400" height="600" style="display:none;"></canvas>
    <div id="loadingScreen" style="display:none;">
        <p id="loadingText">Loading...</p>
    </div>
    <button id="resumeButton" style="display:none;">Resume</button>
    <button id="playAgainButton" style="display:none;">Play Again</button>
    <button id="leaderboardButton" style="display:none;">Leaderboard</button>
</body>
</html>