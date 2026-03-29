<!--
Author: Nozhin Azarpanah
Date: March 14, 2026
Server-side Assignment
-->

<?php
$userEmail = filter_input(INPUT_GET, "email", FILTER_VALIDATE_EMAIL);
$userScore = filter_input(INPUT_GET, "score", FILTER_VALIDATE_INT);

if (!$userEmail) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Petit Prince Leap</title>
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="messagePage">
        <h2 class="title">Petit Prince Leap</h2>
        <p id="messageText">Invalid leaderboard access.</p>
        <div class="linkGroup">
            <a href="index.php">Go Back</a>
        </div>
    </div>
</body>
</html>
<?php
    exit;
}

try {
    $dbh = new PDO("mysql:host=localhost;dbname=Animation Game", "root", "");
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die($e->getMessage());
}

/* only insert if score exists in URL */
if ($userScore !== null && $userScore !== false) {
    $stmt = $dbh->prepare("INSERT INTO Results (email, score) VALUES (?, ?)");
    $stmt->execute([$userEmail, $userScore]);

    header("Location: leaderboard.php?email=" . urlencode($userEmail));
    exit;
}

$stmt = $dbh->prepare("
    SELECT 
        COUNT(*) AS gamesPlayed,
        AVG(score) AS averageScore,
        MAX(score) AS bestScore
    FROM Results
    WHERE email = ?
");
$stmt->execute([$userEmail]);
$userStats = $stmt->fetch();

$stmt = $dbh->prepare("
    SELECT 
        email,
        MAX(score) AS bestScore,
        AVG(score) AS averageScore,
        COUNT(*) AS gamesPlayed
    FROM Results
    GROUP BY email
    ORDER BY bestScore DESC
    LIMIT 5
");
$stmt->execute();
$topUsers = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Petit Prince Leap</title>
    <link rel="icon" type="image/png" href="images/icon.png">
    <link href="https://fonts.googleapis.com/css2?family=Betania+Patmos&family=Cormorant+Garamond&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="messagePage">
        
        <div class="section">
            <p class="sectionTitle">Your Stats</p>

            <div class="userStats">
                <p class="userEmail"><?php echo htmlspecialchars($userEmail); ?></p>
                <p class="userInfo">
                    Games: <?php echo $userStats["gamesPlayed"]; ?> |
                    Avg: <?php echo round($userStats["averageScore"], 2); ?> |
                    Best: <?php echo $userStats["bestScore"]; ?>
                </p>
            </div>
        </div>

        <div class="section">
            <p class="sectionTitle">Top 5 Players</p>

            <div class="linkGroup">
                <?php foreach ($topUsers as $index => $row): ?>
                    <div class="playerRow">
                        <p class="playerEmail">
                            <?php echo $index + 1; ?>. <?php echo htmlspecialchars($row["email"]); ?>
                        </p>
                        <p class="playerInfo">
                            Best: <?php echo $row["bestScore"]; ?> |
                            Avg: <?php echo round($row["averageScore"], 2); ?> |
                            Games: <?php echo $row["gamesPlayed"]; ?>
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="linkGroup">
            <a href="play.php?email=<?php echo urlencode($userEmail); ?>">Play Again</a>
            <a href="index.php">Sign Out</a>
        </div>
    </div>
</body>
</html>