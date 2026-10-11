<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=dental_care', 'root', '');
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    echo "TABLES IN dental_care (" . count($tables) . "): " . implode(', ', $tables) . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}