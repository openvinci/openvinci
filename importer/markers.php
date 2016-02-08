<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$tblMarkers=zipTable($fle, 'Listamar.txt');
if(is_array($tblMarkers)){
    $json['success']=true;
    $record['contabilidad']=$folderId;
    foreach($tblMarkers as $row){
        $record['nombre'] = $row['Marcador'];
        $record['descrip'] = $row['Descripcion'];
        if(!$db->AutoExecute('tbl_marcador',$record,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblMarkers;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>