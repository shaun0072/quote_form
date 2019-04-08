<?php
//DB CONNECT INITIATION AND USAGE OF DATABASE BOTH GETTING AND POSTING DATA

//Returns mysqli object OR error message
function connect_to_db() {
	//Store mysqli() method result in variable
	$mysqli = new mysqli('localhost', 'root', '', 'tmf_db');

	//Handle errors from db connection OR return mysqli object
	if(!$mysqli)
	{
		throw new Exception('Could not connect to database');
	}
	else
	{
		return $mysqli;
	}
}


?>
