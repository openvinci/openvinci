<?php date_default_timezone_set('America/Guatemala');

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

$url=base64_decode($_REQUEST['res']);

$defaults = array(  
	CURLOPT_HEADER => 0, 
	CURLOPT_URL => $url, 
	CURLOPT_FRESH_CONNECT => 1, 
	CURLOPT_RETURNTRANSFER => 1, 
	CURLOPT_FORBID_REUSE => 1,
	CURLOPT_FOLLOWLOCATION =>1
);

//get resource by curl
$handler=curl_init();
curl_setopt_array($handler, $defaults);
$resStream=curl_exec($handler);

if($resStream!==false){
	curl_close($handler);
	$uuid=uniqid();
	$filename="res_{$uuid}.res";
	
	file_put_contents($filename, $resStream);
	
	$to=base64_decode($_REQUEST['to']);
	$fp = fopen($_REQUEST['log'], 'a+');
	fputcsv($fp, array($to, $filename, $url,'res'));
	fclose($fp);
}else{
	$to=base64_decode($_REQUEST['to']);
	$message=curl_error($handler);
	$message="query:{$_REQUEST['pge']}".PHP_EOL."{$message}";
	$json['msg']=$message;
	mail($to,'query errror', $message);
	curl_close($handler);
}
$json['success']=true;
echo json_encode($json);

?>