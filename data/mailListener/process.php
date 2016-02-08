<?php require('mail.php');
require('php_url_merge.php');

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

error_reporting(E_ALL ^ E_NOTICE);
date_default_timezone_set('America/Guatemala');
$url=base64_decode($_REQUEST['pge']);
$defaults = array(  
	CURLOPT_HEADER => 1, 
	CURLOPT_URL => $url, 
	CURLOPT_FRESH_CONNECT => 1, 
	CURLOPT_RETURNTRANSFER => 1, 
	CURLOPT_FORBID_REUSE => 1,
	CURLOPT_FOLLOWLOCATION =>1
); 

//get first page
$handler=curl_init();
curl_setopt_array($handler,$defaults);
$page['index.htm']=curl_exec($handler);
if($page['index.htm']===false){
	$to=base64_decode($_REQUEST['to']);
	$message=curl_error($handler);
	$message="query:{$_REQUEST['pge']}".PHP_EOL."{$message}";
	$json['msg']=$message;
	mail($to,'query errror', $message);
	curl_close($handler);
}else{
	$handlerInfo=curl_getinfo($handler );
	$page['info.txt']=implode("\r\n",$handlerInfo);
	$url=$handlerInfo["url"];
	curl_close($handler);
	$pgedta=parse_url($url);
	//var_dump($pgedta);
	
	//find image tags
	$dom = new DOMDocument('1.0');
  @$dom->loadHTML($page['index.htm']);
  $imgs = $dom->getElementsByTagName('img');
	
	//fixing page urls and creating image load list
  $defaults = array(  
	 CURLOPT_HEADER => 0, 
	 CURLOPT_URL => $url, 
	 CURLOPT_FRESH_CONNECT => 1, 
	 CURLOPT_RETURNTRANSFER => 1, 
	 CURLOPT_FORBID_REUSE => 1,
	 CURLOPT_FOLLOWLOCATION =>1
  );
   
	foreach($imgs as $i => $v){
    $img_uuid = uniqid();
    $src = $v->getAttribute('src');
    $imgurl=resolve_url($url, $src);
		
		$json['imgs']=$imgurl;
    $imgLst[$i]="{$src} --> {$imgurl}";

		$ext=pathinfo($imgurl, PATHINFO_EXTENSION);
		$img_uuid.='.jpg';
		$page['index.htm']=str_replace($src, $img_uuid, $page['index.htm']);
		
		$handler=curl_init();
		curl_setopt_array($handler,$defaults);
		curl_setopt($handler, CURLOPT_URL, $imgurl);
		$page[$img_uuid]=curl_exec($handler);
		if($page[$img_uuid]===false){
			$page[$img_uuid]=curl_error($handler);
			curl_close($handler);
		}else{
			curl_close($handler);
			$imHndlr=imagecreatefromstring($page[$img_uuid]);
			imagejpeg($imHndlr,$img_uuid,15);
			imagedestroy($imHndlr);
			$page[$img_uuid]=file_get_contents($img_uuid);
			unlink($img_uuid);
		}
	}
  if(count($imgLst))$page['images.txt']=implode("\r\n", $imgLst);

	//make zip with data
	$uuid=uniqid();
	$zip = new ZipArchive();
	$filename = "{$uuid}.zip";
	if ($zip->open($filename, ZipArchive::CREATE)!==TRUE) {
    	exit("cannot open <$filename>\n");
	}
	foreach($page as $i => $pg){
		$zip->addFromString($uuid.'/'.$i, $pg);
	}
	$json['numfiles']=$zip->numFiles;
	$json['zip_status']=$zip->status;
	$zip->close();
  $json['zip_size']=filesize($filename);
	
	//mail page
	$subject=$uuid;
	$message=$uuid.'-'.date('Y-m-d');
	$files=array($filename);
	$to=base64_decode($_REQUEST['to']);
	
	multi_attach_mail($to, $subject, $message, $files, $config['user']);
	if(file_exists($filename))unlink($filename);
}

//see for logs older than an hour and kill
$files=scandir('.');
foreach($files as $fle)if(!strstr($fle,'.php')){
    if(date('Ymd') > date('Ymd',filemtime($fle)))unlink($fle);
}

$json['success']=true;
echo json_encode($json);
?>