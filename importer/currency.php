<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$ttable=array();
$currencies = $db->GetAll('SELECT * FROM tbl_moneda');
foreach($currencies as $currency)$ttable[metaphone($currency['nombre'])]=$currency;
unset($currencies);

$logFile=ROOT."/importer/moneda.log";
$log = fopen($logFile, 'w+'); //record of association
fputcsv($log, array('old_id', 'new_id'));

$currencies=zipTable($fle, 'Monedas.txt');
if(is_array($currencies)){
    $json['success']=true;
    foreach($currencies as $row){
        $key=metaphone($currency['nombre']);
        if(!array_key_exists($key, $ttable)){

            $record['nombre']=$row['Moneda'];
            $record['simbolo']=$row['Simbolo'];
            if(!$db->AutoExecute('tbl_moneda',$record,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            };
            $cID=$db->Insert_ID( ); //currency id to pass on

        }else $cID = $ttable[$key]['id'];
        fputcsv($log, array($row['IdMoneda'], $cID));
    }
}else{
    $json['success']=false;
    $json['msg']=$currencies;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>