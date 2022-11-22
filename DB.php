/*
 * @author simone marchi <simone.marchi@ilc.cnr.it>
 */
 <?php

ini_set("memory_limit","1024M");
$config = include('configDB.php');

$host = $config['hostname'];
$userName = $config['username'];
$password = $config['password'];
$dbName = $config['dbname'];

file_put_contents('php://stderr', print_r($_POST, TRUE));

$sqlcommand = $_POST['query'];
// Create database connection
try  {
    $mysqli = new mysqli($host, $userName, $password, $dbName);
    if ($mysqli->connect_error) {
        file_put_contents('php://stderr', 'Connect Error: ' . $mysqli->connect_error . PHP_EOL);
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('type' => 'ERROR', 'message' => 'Connect Error: ' . $mysqli->connect_error));
        $mysqli->close();
        return;
    }
    $tabledata = array();
    
    if($result = $mysqli->query($sqlcommand)) {// or die mysqli_error($mysqli);    
        while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $tabledata[] = mb_convert_encoding($row,'UTF-8'); 
        }
        $result->close();
        $mysqli->close();
    } else {
        if( $mysqli -> errno > 0) {
            file_put_contents('php://stderr', "ERR: " .  mysqli_error($mysqli). PHP_EOL);
            http_response_code(500);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(array('type' => 'ERROR', 'message' => mysqli_error($mysqli)));
            $mysqli->close();
            return;
        }
    }
    
} catch (mysqli_sql_exception $e) {
    file_put_contents('php://stderr',  $e->errorMessage(). PHP_EOL);
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(array('type' => 'ERROR', 'message' => 'mysqli_sql_exception: ' . $e->errorMessage()));
    return;
}

if (json_encode($tabledata) === false){
    file_put_contents('php://stderr', 'A json_encode error: '.json_last_error_msg() . PHP_EOL);
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(array('type' => 'ERROR', 'message' => json_last_error_msg()));

} else {
    //    file_put_contents('php://stderr', "ERR: " .  json_encode($tabledata). PHP_EOL);
    header('Content-Type: application/json');
    echo json_encode($tabledata)."\n";
}

?>
