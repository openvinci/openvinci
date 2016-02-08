<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$ttable=array();
$providers = $db->GetAll('SELECT * FROM tbl_proveedor');
foreach($providers as $provider)$ttable[metaphone($provider['nombre'])]=$provider;
unset($providers);

$tblSuppliers=zipTable($fle, 'Detpartidas.txt');
if(is_array($tblSuppliers)){
    $json['success']=true;
    foreach($tblSuppliers as $row)if($row['Proveedor']){
        $key=metaphone($row['Proveedor']);
        if(!array_key_exists($key, $ttable)){
            //provider new
            $ttable[$key]=array();
            $ttable[$key]['nombre']=$row['Proveedor'];
            $ttable[$key]['NIT']=$row['Nitproveedor'];
        }else{
            //provider in list, verify NIT
            if($row['Nitproveedor']){
                if(!$ttable[$key]['NIT'])$ttable[$key]['newNIT']=$row['Nitproveedor'];
            }
        }
    }
    //inserting new providers on database
    $json['success']=true;
    foreach($ttable as $provider){
        if(!$provider['id']){
            if(!$db->AutoExecute('tbl_proveedor',$provider,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            }
        }else{
            if($provider['newNIT']){
                //if NIT is found then update
                if(!$db->Execute("UPDATE tbl_proveedor SET NIT='{$provider['newNIT']}'WHERE id={$provider['id']}")){
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    break;
                }
            }
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblSuppliers;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>