<?php require('mail.php');

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

date_default_timezone_set('America/Guatemala');
error_reporting(E_ALL ^ E_NOTICE);

if (($handle = fopen($_REQUEST['log'], "r")) !== FALSE) {
	$recips=array();
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        if($data[3]=='pic')$recips[$data[0]][$data[1]]=pathinfo($data[2], PATHINFO_BASENAME);
    }
    fclose($handle);
	foreach($recips as $to => $pics){
		//pack pictures on zip
		$uuid=uniqid();
		$no=1;
		$zip = new ZipArchive();
		$filename = "pic-{$uuid}-{$no}.zip";
		$subject=$uuid;
		$message=$uuid.'-'.date('Y-m-d');
		$files=array($filename);
		
		if ($zip->open($filename, ZipArchive::CREATE)!==TRUE)exit("cannot open <$filename>\n");
		foreach($pics as $pic => $fnme){
			
			if($amount + filesize($pic) >= 1048576 && $i < count($pics)-1){
				$zip->close();
				multi_attach_mail($to, $subject, $message, $files, $config['user']);
				unlink($filename);
				$amount=0;
				$no++;
				$filename = "pic-{$uuid}-{$no}.zip";
				$files=array($filename);
				$subject='query system '.$uuid;
				
				if ($zip->open($filename, ZipArchive::CREATE)!==TRUE)exit("cannot open <$filename>\n");
			}
			$zip->addFile($pic, $fnme);
			$amount+=filesize($pic);
		}
        $zip->addFile($_REQUEST['log']);
		$zip->close();
		multi_attach_mail($to, $subject, $message, $files, $config['user']);
		unlink($filename);
		foreach($pics as $pic => $fnme)unlink($pic);
	}

	//see for logs older than an hour and kill
	$files=scandir('.');
	foreach($files as $fle)if(!strstr($fle,'.php')){
		if(date('Ymd') > date('Ymd',filemtime($fle)))unlink($fle);
	}
}
?>