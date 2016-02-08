<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$ttable=array();
$bancs = $db->GetAll('SELECT * FROM tbl_tipo_documento');
foreach($bancs as $bank)$ttable[metaphone($bank['banco_nombre']).$bank['banco_cuenta']]=$bank;
unset($bancs);

//loading currency log
$currency=array();
$handle = fopen('moneda.log', "r");
while (($data = fgetcsv($handle)) !== FALSE)if((int)$data[0])$currency[$data[0]] = $data;
fclose($handle);

$bancAccounts=zipTable($fle, 'Bancos.txt');
if(is_array($bancAccounts)){
    $json['success']=true;
    foreach($bancAccounts as $row){
        $record['moneda'] = (int)$currency[$row['Idmoneda']]['1'];
        $record['contabilidad'] = (int)$folderId;
        $record['cuenta'] = $row['Idcuenta'];
        $record['banco_nombre'] = $row['Nombre_banco'];
        $record['banco_cuenta'] = $row['Numero_cuenta'];
        $record['cheque_prefijo'] = $row['Prefijo_cheque'];
        $record['cheque_numero'] = (int)$row['Numero_cheque'];
        $record['cheque_lugares'] = (int)$row['Lugares_cheque'];
        $record['cheque_idioma'] = $row['Idiomache'];
        $record['cheque_operado'] = $row['Ch_operado'];
        $record['cheque_revisado'] = $row['Ch_revisado'];
        $record['cheque_autorizado'] = $row['Ch_autorizado'];
        if($row['Avisar_sobregiro']=='F')$record['avisar_sobregiro']=false; else $record['avisar_sobregiro']=true;
        if($row['Tipo_conciliacion']=='Libros a Banco')$record['concil_tipo']='LaB'; else $record['concil_tipo']='BaL';
        $record['concil_operado_nombre'] = $row['Co_operado'];
        $record['concil_operado_cargo'] = $row['Co_operado_cargo'];
        $record['concil_revisado_nombre'] = $row['Co_revisado'];
        $record['concil_revisado_cargo'] = $row['Co_revisado_cargo'];
        $record['concil_autorizado_nombre'] = $row['Co_autorizado'];
        $record['concil_autorizado_cargo'] = $row['Co_autorizado_cargo'];

        if(!$db->AutoExecute('tbl_banco',$record,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$bancAccounts;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>