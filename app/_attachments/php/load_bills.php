<?php
/*
Deliverable 2
Author: Jeremy Fox
Created For: MIU Online
load_bills.php
*/

ini_set('display_errors', 1);
error_reporting(E_ALL);

$chosenFormat = "";

$number_of_bills = isset($_GET['num']) ? intval($_GET['num']) : 20;

$output = array();

for($i = 1; $i <= $number_of_bills; $i++){
	$key = rand(111111111, 999999999);
	
	$name     = Array("name" => Array("Name:","John Doe"));
	$payto    = Array("payto" => Array("Pay To:","Fullsail University"));
	$amount   = Array("amount" => Array("Amount:","250"));
  $account  = Array("account" => Array("From Account:","Bank of America - Checking"));
  $payon    = Array("payon" => Array("Pay On:","2013-05-15"));
  $notes    = Array("notes" => Array("Notes:","Student loans"));
  $remember = Array("remember" => Array("Remember This Payment:","Yes"));
	
  $bill = $name + $payto + $amount + $account + $payon + $notes + $remember;

  $output[] = Array($key => $bill);
}

header('Content-type: application/json');
echo json_encode($output);

?>