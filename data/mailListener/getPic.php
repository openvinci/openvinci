<?php date_default_timezone_set('America/Guatemala');

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

$url=base64_decode($_REQUEST['pic']);

$defaults = array(  
	CURLOPT_HEADER => 0, 
	CURLOPT_URL => $url, 
	CURLOPT_FRESH_CONNECT => 1, 
	CURLOPT_RETURNTRANSFER => 1, 
	CURLOPT_FORBID_REUSE => 1,
	CURLOPT_FOLLOWLOCATION =>1
); 

//get picture by curl
$handler=curl_init();
curl_setopt_array($handler, $defaults);
$picStream=curl_exec($handler);

if($picStream!==false){
	curl_close($handler);
	$im=imagecreatefromstring($picStream);
	$uuid=uniqid();
	$filename="pic_{$uuid}.jpg";
	
	$ancho_orig = imagesx($im);
	$alto_orig = imagesy($im); 
	if($ancho_orig>1024 || $alto_orig>1024){
		//resample if necesary
		$alto=1280;	$ancho=1280;
		$r_orig=$ancho_orig/$alto_orig;
		if ($r_orig < 1)$ancho = $alto * $r_orig; else $alto = $ancho/$r_orig;
		
		$im2 = imagecreatetruecolor($ancho, $alto);
		imagecopyresampled($im2, $im, 0, 0, 0, 0, $ancho, $alto, $ancho_orig, $alto_orig);
		imagejpeg($im2,$filename,82);
		imagedestroy($im2);
	}else{
		file_put_contents($filename, $picStream);
	}
	imagedestroy($im);
	$to=base64_decode($_REQUEST['to']);
	$fp = fopen($_REQUEST['log'], 'a+');
	fputcsv($fp, array($to, $filename, $url,'pic'));
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