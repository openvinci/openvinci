<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$ttable=array();
$docTypes = $db->GetAll('SELECT * FROM tbl_tipo_documento');
foreach($docTypes as $docType)$ttable[metaphone($docType['nombre'])]=$docType;
unset($docTypes);

$tblDocTypes=zipTable($fle, 'Detpartidas.txt');
if(is_array($tblDocTypes)){
    foreach($tblDocTypes as $row)if($row['Tipodoc']){
        $key=metaphone($row['Tipodoc']);
        if(!array_key_exists($key, $ttable)){
            //docType new
            $ttable[$key]=array();
            $ttable[$key]['nombre']=$row['Tipodoc'];
        }
    }
    //inserting new docTypes on database
    $json['success']=true;
    foreach($ttable as $docType)if(!$docType['id']){
        if(!$db->AutoExecute('tbl_tipo_documento',$docType,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }
    }

}else{
    $json['success']=false;
    $json['msg']=$tblDocTypes;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>