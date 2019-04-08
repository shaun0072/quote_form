<?php
header("Access-Control-Allow-Origin: *");
header("content-type: application/x-www-form-urlencoded format");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");

include('db_fns.php');


$customers = array();

if($_SERVER['REQUEST_METHOD'] === 'GET') {
  //Connect to tmfc_db and store result in variable
  $conn = connect_to_db();

  //Application INFO
  $result = $conn->query('SELECT * FROM customers ORDER BY company_name ASC');

  if(!$result) {
  	echo "Error with Database Query";
  	exit;
  }

//$result = [["vendor" => "haviland"],["vendor" => "ABrite"],... ]
  if($result->num_rows > 0) {
    $key = 0;
  	while($row = $result->fetch_assoc()) {
      //$row = ["vendor" => "haviland"]
      $customers[] = [
          "title" => $row['company_name'],
          "key" => $key++,
          "description" => $row['contact'],
          "email" => $row['email'],
          "phone" => $row['phone']
        ];
      }
  }

  echo json_encode($customers);

}
?>
