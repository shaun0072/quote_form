<?php
header("Access-Control-Allow-Origin: *");
header("content-type: application/x-www-form-urlencoded format");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");

include('db_fns.php');

$conn = connect_to_db();

$query = "INSERT INTO quotes VALUES ('')";

if ($conn->query($query) === TRUE) {
    $generatedNumber = ($conn->insert_id + 1);
    echo $generatedNumber;
} else {
    echo "Error: " . $query . "<br>" . $conn->error;
}

$conn->close();
?>
