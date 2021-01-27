<?php

ini_set("memory_limit","512M");

$host = "localhost";
$userName = "simple";
$password = "simple12";
$dbName = "simplelexicon_new";

file_put_contents('php://stderr', print_r($_POST, TRUE));

$sqlcommand = $_POST['query'];
// Create database connection
try  {
    $mysqli = new mysqli($host, $userName, $password, $dbName);
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }
    $tabledata = array();
    if($result = $mysqli->query($sqlcommand)) {// or die mysqli_error($mysqli);    
        while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $tabledata[] = $row; 
        }
        $result->close();
    } else {
        file_put_contents('php://stderr', mysqli_error($mysqli));
        header('HTTP/1.1 500 Internal Server Booboo');
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('message' => 'ERROR', 'code' => 1337));
    }
    
    $mysqli->close();
} catch (mysqli_sql_exception $e) {
    file_put_contents('php://stderr', $e);
}


header('Content-Type: application/json');
echo json_encode($tabledata)."\n";

?>
