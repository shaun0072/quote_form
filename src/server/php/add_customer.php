<?php
header("Access-Control-Allow-Origin: *");
header("content-type: application/x-www-form-urlencoded format");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");

include('db_fns.php');

if( $_SERVER['REQUEST_METHOD'] === 'POST') {
	function changeEmptyToNull($el) {
    return (!empty($el) || $el === "0" ) ? $el : NULL;
	}
	$_POST = array_map("changeEmptyToNull", $_POST);

	//Set all array keys to variables with the same name
	extract($_POST);

	$auto_generate = '';

  //Connect to tmfc_db and store result in variable
	$conn = connect_to_db();

	//ENTER PRODUCT INFO INTO PRODUCT TABLE
	$add_customer = $conn->prepare("INSERT INTO customers (
    customer_id,
		company_name,
		contact,
		phone,
		email
	)
	VALUES (?,?,?,?,?)");

	//bind
	$add_customer->bind_param('sssss', $auto_generate, $company_name, $contact, $phone, $email);

	//execute
	$execute = $add_customer->execute();
	if(!$execute) {
		echo htmlspecialchars($add_customer->error);
		exit;
	}
	echo json_encode($_POST);
}
?>
