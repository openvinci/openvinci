<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$sql="SELECT b.id FROM tbl_banco AS b WHERE b.contabilidad = {$folderId}";
$acc=$db->GetRow($sql);

$tblPayees=zipTable($fle, 'Listaben.txt');
if(is_array($tblPayees)){
    $json['success']=true;
    $record['banco']=$acc['id'];
    foreach($tblPayees as $row)if($row['Beneficiario_cheque']){

        $record['nombre']=$row['Beneficiario_cheque'];

        if(!$db->AutoExecute('tbl_beneficiario',$record,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblPayees;
}


$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>