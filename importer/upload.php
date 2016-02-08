<?php require('../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
//$db->debug=true;
if($app->acl(104)){
    $fle=ROOT."/importer/{$_FILES['workfolder']['name']}";
    if (move_uploaded_file($_FILES['workfolder']['tmp_name'], $fle)) {
        $zip = new ZipArchive;
        $res = $zip->open($fle);
        if ($res === TRUE) {
            $json['success']=true;
            $json['msg']=pathinfo($fle, PATHINFO_BASENAME);
        }else{
            $json['success']=false;
            $json['msg']='El formato del archivo es incorrecto';
            unlink($fle);
        }
    }else{
        $json['success']=false;
        $json['msg']='Posible Ataque';
    }
}else {
    $json['success'] = false;
    $json['msg'] = 'Falta de permisos para realizar esta accion';
}

$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);