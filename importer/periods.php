<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];

$logFile=ROOT."/importer/periodo.log";
$log = fopen($logFile, 'w+'); //record of association
fputcsv($log, array('old_id', 'new_id', 'closed'));

$periods = $db->GetAll('SELECT * FROM tbl_periodo');
foreach($periods as $k => $v){
    $ttable[strtotime($v['inicio']).strtotime($v['fin'])]=$v;
}

$tblPeriods=zipTable($fle, 'Periodos.txt');
if(is_array($tblPeriods)){
    $json['success']=true;
    foreach($tblPeriods as $row){
        $id=array_key_exists(strtotime($row['Fecha_ini']).strtotime($row['Fecha_fin']), $ttable);
        if(!$id){
            $chk=false;
            $msg='';
            //see if period does not overlap existing one
            foreach($ttable as $period){
                if($period['inicio'] <= $row['Fecha_ini'] && $row['Fecha_ini'] <= $period['fin'] && !$chk)$chk = true;
                if($period['inicio'] <= $row['Fecha_fin'] && $row['Fecha_fin'] <= $period['fin'] && !$chk)$chk = true;
                if($chk){
                    $msg="Superposicion de periodos: db->tbl_periodo->{$period['id']} zip->Periodos.txt->{$row[0]}";
                    break;
                }
            }
            if($chk){
                //period overlapping, report
                $json['success']=false;
                $json['msg']=$msg;
            }else{
                //period clear for insert
                $record['nombre']=$row['Nombre_periodo'];
                $record['inicio']=strtotime($row['Fecha_ini']);
                $record['fin']=strtotime($row['Fecha_fin']);
                $record['ejercicio']=(int)date('Y',$record['inicio']);
                if(!$db->AutoExecute('tbl_periodo',$record,'INSERT')){
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    break;
                };

                $cID=$db->Insert_ID( ); //period id to pass on
            }
        }else $cID = $ttable[strtotime($row['Fecha_ini']).strtotime($row['Fecha_fin'])]['id'];

        //write on log id match between zip and table
        fputcsv($log, array($row['Idperiodo'], $cID, ($row['Cerrado']=='F')?0:1));
    }
    fclose($log);
}else{
    $json['success']=false;
    $json['msg']=$tblPeriods;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>