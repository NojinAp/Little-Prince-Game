<!--
Author: Nozhin Azarpanah
Date: March 29, 2026
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
    $dbh = new PDO("mysql:host=localhost;dbname=azarpann_db", "azarpann_local", "W{u94OMW");
} catch(Exception $e) {
    die ($e->getMessage());
}

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
        p.nickname,
        r.email,
        MAX(r.score) AS bestScore,
        AVG(r.score) AS averageScore,
        COUNT(*) AS gamesPlayed
    FROM Results r
    JOIN Players p ON r.email = p.email
    GROUP BY r.email, p.nickname
    ORDER BY bestScore DESC
    LIMIT 5
");
$stmt->execute();
$topUsers = $stmt->fetchAll();

$stmt = $dbh->prepare("SELECT nickname FROM Players WHERE email = ?");
$stmt->execute([$userEmail]);
$userRow = $stmt->fetch();
$userNickname = $userRow["nickname"];
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
                <p class="userNickname"><?php echo htmlspecialchars($userNickname); ?>
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
                        <p class="playerNickname">
                            <?php echo htmlspecialchars($row["nickname"]); ?>
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