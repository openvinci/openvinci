<?php require('../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
$fle=ROOT."/importer/{$_POST['id']}";
//$db->debug=true;

if(is_file($fle)) {
    unlink($fle);
    $json['success']=true;
    $json['msg']='Importación exitosa';
}else{
    $json['success']=false;
    $json['msg']='el archivo no existe';
}

//clear insert logs
//foreach(glob('*.log') as $filename)unlink($filename);

$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);