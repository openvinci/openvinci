<?php require('../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
//$db->debug=true;
$folderId=filter_input(INPUT_POST, 'folder', FILTER_VALIDATE_INT);
$folder=$db->GetRow("SELECT * FROM tbl_contabilidad WHERE id = {$folderId}");
$accs=array();

function summarize($idx){   //tree summarize function
    global $accs;
    $accs[$idx]['fin_debe'] = $accs[$idx]['ini_debe'] + $accs[$idx]['per_debe'];
    $accs[$idx]['fin_haber'] = $accs[$idx]['ini_haber'] + $accs[$idx]['per_haber'];
    $parent = $accs[$idx]['padre'];
    if($parent){
        //$accs[$parent]['ini_debe']+= $accs[$idx]['ini_debe'];
        //$accs[$parent]['ini_haber']+= $accs[$idx]['ini_haber'];
        $accs[$parent]['per_debe']+= $accs[$idx]['per_debe'];
        $accs[$parent]['per_haber']+= $accs[$idx]['per_haber'];
        summarize($parent);
    }
}

if($app->acl(39)){
    $json['success']=true;
    //get last balance info for folder
    $sql="SELECT p.id AS pId, b.id AS bId FROM tbl_balance AS b Left Join tbl_periodo AS p ON b.periodo = p.id
          WHERE b.contabilidad = {$folderId} ORDER BY p.inicio DESC";
    $rw = $db->GetRow($sql);
    $lastBalanceClosed = $rw['bId']; //last balance been closed for this folder
    $lastPeriodClosed = $rw['pId']; //last period been closed for this folder
    unset($rw);

    //find period to close
    $sql="SELECT p.id FROM tbl_periodo AS p WHERE
          p.inicio > (SELECT p2.fin FROM tbl_periodo AS p2 WHERE p2.id = {$lastPeriodClosed})
          ORDER BY p.inicio ASC";
    $rw = $db->GetRow($sql);
    $periodToClose = $rw['id']; //period that needs to de closed
    unset($rw);

    //see if period to close closes exercice
    $sql="SELECT * FROM tbl_periodo WHERE id={$periodToClose}";
    $period = $db->GetRow($sql);
    $sql="SELECT COUNT(a.pId) AS pid, COUNT(a.bId) AS bid
          FROM(
            SELECT p.id AS pId,(
              SELECT b.id FROM tbl_balance AS b
              WHERE	b.periodo = p.id
              AND b.contabilidad = {$folderId}
            )AS bId
            FROM tbl_periodo AS p
            WHERE p.ejercicio = '{$period['ejercicio']}'
          )AS a";
    $row = $db->GetRow($sql);
    if($row['pid'] - $row['bid'] == 1)$periodCloseExercice = true; else $periodCloseExercice = false;

    if($periodCloseExercice){
        //check if first period of next exercice it's been created
        $sql="SELECT p.id FROM tbl_periodo AS p WHERE
          p.inicio > (SELECT p2.fin FROM tbl_periodo AS p2 WHERE p2.id = {$periodToClose})
          ORDER BY p.inicio ASC";
        $rw = $db->GetRow($sql);
        if($rw){
            $periodOpenNextExercice = $rw['id']; //period that opens exercice
        }else{
            $json['success']=false;
            $json['msg']="Este periodo cierra el ejercicio actual y no hay periodo definido para el proximo ejercicio";
        }
        unset($rw);
    }

    //see if period to close opens exercice
    if($row['bid']==0)$periodOpenExercice=true;

    if(!$json['success'])goto abort;
    unset($row);


    //get account catalog for folder
    $sql="
SELECT tbl_cuenta.*, tbl_grupo.debe AS grp_debe
FROM tbl_cuenta
LEFT JOIN tbl_grupo ON tbl_cuenta.grupo = tbl_grupo.id
WHERE tbl_cuenta.catalogo = {$folder['catalogo']}
";
    foreach($db->GetAll($sql) AS $rw){
        $accs[$rw['id']]=$rw;
        $accs[$rw['id']]['ini_debe']=0;
        $accs[$rw['id']]['ini_haber']=0;
        $accs[$rw['id']]['per_debe']=0;
        $accs[$rw['id']]['per_haber']=0;
        $accs[$rw['id']]['fin_debe']=0;
        $accs[$rw['id']]['fin_haber']=0;
    }

    //get last balance detail account values
    if(!$periodOpenExercice){
        $sql="SELECT bd.cuenta, bd.fin_debe, bd.fin_haber FROM tbl_balance_detalle AS bd WHERE balance = {$lastBalanceClosed}";
        foreach($db->GetAll($sql) as $idx => $acc){

            $start = $db->GetRow($sql);
            $accs[$acc['cuenta']]['ini_debe']=(float)$acc['fin_debe'];
            $accs[$acc['cuenta']]['ini_haber']=(float)$acc['fin_haber'];
        }
    }

    //get folder dependencies list
    $sql="SELECT c.origen, cont.nombre
          FROM tbl_consolidados AS c
          Left Join tbl_contabilidad AS cont ON c.origen = cont.id
          WHERE c.contabilidad = {$folder['id']}";
    $orgsStr = "{$folderId}";
    foreach($db->GetAll($sql) as $v){
        $origins[$v['origen']]=$v['nombre'];
        $orgsStr .= ", {$v['origen']}";

        //check if period is closed for depencencies
        $sql="SELECT id FROM tbl_balance WHERE periodo = {$periodToClose} AND contabilidad = {$v['origen']}";
        $rw = $db->GetRow($sql);
        if(!$rw['id']){
            $json['success']=false;
            $json['msg']="Balance no cerrado para la contabilidad {$v['nombre']}";
            break;
        }
    }
    if(!$json['success'])goto abort;

    //get movements for period, including dependencies
    foreach($accs as $idx => $acc)if($acc['detalle']){
        $sql="SELECT SUM(er.debe) AS debe, SUM(er.haber) AS haber
              FROM tbl_partida_detalle AS er
              Left Join tbl_partida AS e ON er.partida = e.id
              WHERE er.cuenta = '{$idx}'
              AND e.periodo = {$periodToClose}
              AND e.contabilidad IN({$orgsStr})
              GROUP BY er.cuenta";
        $rw = $db->GetRow($sql);
        $accs[$idx]['per_debe']=(float)$rw['debe'];
        $accs[$idx]['per_haber']=(float)$rw['haber'];
    }

    //summarize
    foreach($accs as $idx => $acc)if($acc['detalle'])summarize($idx);

    //$db->StartTrans();
    if($periodCloseExercice){
        //generate close period entry

        $closeErows=array(); //close entry rows array
        $openErows=array(); //open entry rows array
        $ttl=0; //total amount of close entry
        foreach($accs as $idx => $acc)if($acc['detalle'] && $idx != $folder['cuenta_cierre'] ){
            if($acc['fin_debe'] + $acc['fin_haber'] > 0){
                if(in_array($acc['grupo'], array(1,2,7))){
                    //get detail rows for open entry
                    $openErows[$idx]['debe'] = $accs[$idx]['fin_debe'];
                    $openErows[$idx]['haber'] = $accs[$idx]['fin_haber'];
                }
                //get detail rows for close entry
                $closeErows[$idx]['haber'] = $accs[$idx]['fin_debe'];
                $closeErows[$idx]['debe'] = $accs[$idx]['fin_haber'];

                //modify period values according to last entry
                $accs[$idx]['per_haber'] += $accs[$idx]['fin_debe'];
                $accs[$idx]['per_debe'] += $accs[$idx]['fin_haber'];

                $ttl+=($accs[$idx]['fin_debe'] - $accs[$idx]['fin_haber']);
            }
        }

        if($ttl > 0){
            //exercice has utilities
            $closeErows[$folder['cuenta_cierre']]['haber'] = $ttl;
            $accs[$folder['cuenta_cierre']]['per_haber'] += $ttl;
        }else{
            //exercice has losses
            $ttl=abs($ttl);
            $closeErows[$folder['cuenta_cierre']]['debe'] = $ttl;
            $accs[$folder['cuenta_cierre']]['per_debe'] += $ttl;
        }

        $entryValue=0;
        foreach($closeErows as $rw)$entryValue+=$rw['debe'];

        //save close exercice entry
        $record = array();
        $book = $db->GetRow("SELECT * FROM tbl_libro WHERE tipo='diario' AND contabilidad = {$folderId}");

        $record['contabilidad']=$folderId;
        $record['libro'] = $book['id'];
        $record['periodo'] = $periodToClose;
        $record['fecha'] = $period['fin'];
        $record['tipo_partida'] = $app->config('tpCierre');
        if($folder['tipo_numeracion']=='global'){
            $record['numero_partida']=$folder['prefijo_partida'].str_pad($folder['numero_partida'],$folder['lugares_partida'],STR_PAD_LEFT);
            $sql="UPDATE tbl_contabilidad SET numero_partida = numero_partida + 1 WHERE id={$folderId}";
            $folder['numero_partida']++;
        }else{
            $record['numero_partida']=$book['prefijo_partida'].str_pad($book['numero_partida'],$book['lugares_partida'],STR_PAD_LEFT);
            $sql="UPDATE tbl_libro SET numero_partida = numero_partida + 1 WHERE id={$book['id']}";
            $book['numero_partida']++;
        }
        $db->Execute($sql); //update entry number accordingly
        $record['referencia'] = 'CIERRE';
        $record['concepto']= "Cierre del ultimo periodo del ejercicio ".$period['ejercicio'];
        $record['valor']=$entryValue;
        $record['anulada']=false;

        if($db->AutoExecute('tbl_partida', $record,'INSERT')){
            $cId=$db->Insert_ID( ); //entry number to pass it on
            foreach($closeErows as $idx =>$row){
                $row['partida']=$cId;
                $row['catalogo']=$folder['catalogo'];
                $row['cuenta']=$idx;
                if($db->AutoExecute('tbl_partida_detalle', $row,'INSERT')){

                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    goto abort;
                }
            }
        }else{
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            goto abort;
        }

        //summarize again
        foreach($accs as $idx => $acc)if($acc['detalle'])summarize($idx);
    }

    //save balance
    $record = array();
    $record['contabilidad']=$folderId;
    $record['periodo']=$periodToClose;

    if(!$db->AutoExecute('tbl_balance',$record,'INSERT')){
        $json['success']=false;
        $json['msg']=$db->ErrorMsg();
        goto abort;
    }else{
        $cID=$db->Insert_ID( ); //balance id to pass on
        foreach($accs as $idx => $acc){
            $acc['balance'] = $cID;
            $acc['catalogo'] = $folder['catalogo'];
            $acc['cuenta'] = $idx;

            if($acc['ini_debe']+$acc['ini_haber']+$acc['per_debe']+$acc['per_haber'] > 0){
                if(!$db->AutoExecute('tbl_balance_detalle',$acc,'INSERT')){
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    goto abort;
                }
            }

        }
    }

    //generate next period open entry depending of folder config
    $json['debug']['periodCloseExercice']=$periodCloseExercice;
    $json['debug']['folder']=$folder;
    if($periodCloseExercice && $folder['tipo_cierre']=='total'){


        $ttlDbt=0; $ttlCrt=0; //total debit & credit for open entry
        foreach($openErows as $idx => $acc){
            $ttlDbt+=$acc['debe'];
            $ttlCrt+=$acc['haber'];
        }
        if($ttlDbt != $ttlCrt){
            if($ttlDbt > $ttlCrt){
                $openErows[$folder['cuenta_cierre']]['haber'] = $ttlDbt - $ttlCrt;
            }else{
                $openErows[$folder['cuenta_cierre']]['debe'] = $ttlCrt - $ttlDbt;
            }
        }

        //save open exercice entry
        $record = array();
        $book = $db->GetRow("SELECT * FROM tbl_libro WHERE tipo='diario' AND contabilidad = {$folderId}");

        $record['contabilidad']=$folderId;
        $record['libro'] = $book['id'];
        $record['periodo'] = $periodOpenNextExercice;
        $rw=$db->GetRow("SELECT * FROM tbl_periodo WHERE id={$periodOpenNextExercice}");
        $record['fecha'] = $rw['inicio'];
        $record['tipo_partida'] = $app->config('tpApertura');
        if($folder['tipo_numeracion']=='global'){
            $record['numero_partida']=$folder['prefijo_partida'].str_pad($folder['numero_partida'],$folder['lugares_partida'],STR_PAD_LEFT);
            $sql="UPDATE tbl_contabilidad SET numero_partida = numero_partida + 1 WHERE id={$folderId}";
            $folder['numero_partida']++;
        }else{
            $record['numero_partida']=$book['prefijo_partida'].str_pad($book['numero_partida'],$book['lugares_partida'],STR_PAD_LEFT);
            $sql="UPDATE tbl_libro SET numero_partida = numero_partida + 1 WHERE id={$book['id']}";
            $book['numero_partida']++;
        }
        $db->Execute($sql); //update entry number accordingly
        $record['referencia'] = 'PAP';
        $record['concepto']= "Apertura del primer periodo del ejercicio ".$rw['ejercicio'];
        if($ttlDbt > $ttlCrt)$record['valor']=$ttlDbt; else $record['valor']=$ttlCrt;
        $record['anulada']=false;

        if($db->AutoExecute('tbl_partida', $record,'INSERT')){
            $cId=$db->Insert_ID( ); //entry number to pass it on
            foreach($openErows as $idx =>$row){
                $row['partida']=$cId;
                $row['catalogo']=$folder['catalogo'];
                $row['cuenta']=$idx;
                if($db->AutoExecute('tbl_partida_detalle', $row,'INSERT')){

                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    goto abort;
                }
            }
        }else{
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            goto abort;
        }
    }
    //$db->CompleteTrans();

    $json['msg']='Balance cerrado sin incidentes';
}else{
    $json['success']=false;
    $json['msg']='Falta de permisos para realizar esta accion';
}

abort:

$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>