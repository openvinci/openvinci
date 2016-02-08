<?php require('mail.php');

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

date_default_timezone_set('America/Guatemala');
error_reporting(E_ALL ^ E_NOTICE);

if (($handle = fopen($_REQUEST['log'], "r")) !== FALSE) {
	$recips=array();
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        if($data[3]=='res')$recips[$data[0]][$data[1]]=pathinfo($data[2], PATHINFO_BASENAME);
    }
    fclose($handle);
	
	foreach($recips as $to => $res){
		//pack resources on a single zip
		$uuid=uniqid();
		$zip = new ZipArchive();
		$filename = "res-{$uuid}.zip";
		
		if ($zip->open($filename, ZipArchive::CREATE)!==TRUE)exit("cannot open <$filename>\n");
		foreach($res as $rs => $fnme){
			$zip->addFile($rs, $fnme);
		}
        $zip->addFile($_REQUEST['log']);
		$zip->close();
		foreach($res as $rs => $fnme)unlink($rs);
		
		//split content to array
		$handle = fopen($filename, "rb");
		while (!feof($handle)) {
			$contents[] = fread($handle, 1048576);
		}
		fclose($handle);	
		//kill zip container
		unlink($filename);
		
		//pack array and send
		
		$subject=$uuid;
    	foreach($contents as $i => $v){
			$c=str_pad($i, 3, "0", STR_PAD_LEFT);
			$partName="res-{$uuid}-{$c}.chnk";
			$handle = fopen($partName, "wb");
			fwrite($handle, $v, 1048576);
			fclose($handle);

			
			$message=$uuid.'-'.date('Y-m-d').PHP_EOL."part {$i} of".count($contents);
			multi_attach_mail($to, $subject, $message, array($partName), $config['user']);
			unlink($partName);
		}
	}

    //see for logs older than an hour and kill
    $files=scandir('.');
    foreach($files as $fle)if(!strstr($fle,'.php')){
        if(date('Ymd') > date('Ymd',filemtime($fle)))unlink($fle);
    }
}
?>