<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$raw_balance = zipTable($fle, 'Balances.txt');
if(is_array($raw_balance)) {
    $json['success']=true;
    //get id relationship for periods
    $period = array();
    $handle = fopen('periodo.log', "r");
    while (($data = fgetcsv($handle)) !== FALSE)if((int)$data[0])$period[$data[0]] = $data;
    fclose($handle);

    foreach($period as $prd)if((bool)$prd[2]){
        $record['contabilidad']=$folderId;
        $record['periodo']=$prd['1'];

        if(!$db->AutoExecute('tbl_balance',$record,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }else{
            $cID=$db->Insert_ID( ); //balance id to pass on
            foreach($raw_balance as $balance)if($balance['Idperiodo']==$prd[0]){
                $rec['balance']=$cID;
                //$rec['cuenta']=(float)preg_replace('/\D/','',$balance['Idcuenta']);
                $rec['catalogo']=$catalogId;
                $rec['cuenta']=$balance['Idcuenta'];
                $rec['ini_debe']=(float)$balance['Inidebe'];
                $rec['ini_haber']=(float)$balance['Inihaber'];
                $rec['per_debe']=(float)$balance['Perdebe'];
                $rec['per_haber']=(float)$balance['Perhaber'];
                $rec['fin_debe']=(float)$balance['Findebe'];
                $rec['fin_haber']=(float)$balance['Finhaber'];

                if(!$db->AutoExecute('tbl_balance_detalle',$rec,'INSERT')){
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    break 2;
                }
            }
        }
    }

}else{
    $json['success']=false;
    $json['msg']=$raw_balance;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>