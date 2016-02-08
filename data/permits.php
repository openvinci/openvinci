<?php include('../core.php'); 
	$config = simplexml_load_file(ROOT.'/config.xml');
	$records=array();
	if($app->acl(1) || $app->acl(2)){
		foreach($config->acl->permit as $permit){
			unset($rec);
			$rec['boxLabel']=(string)$permit;
			$rec['name']='permits';
			$rec['inputValue']=(string)$permit['id'];
			$records[]=$rec;
			
		}
		echo json_encode($records);
	}else echo '{success:false, msg:"sin permisos para realizar la operación"}';
?>