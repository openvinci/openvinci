<?php require('../../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
//$db->debug=true;
$folderId=filter_input(INPUT_GET, 'folder', FILTER_VALIDATE_INT);
$folder=$db->GetRow("SELECT * FROM tbl_contabilidad WHERE id = {$folderId}");
$accs=array();
$totals=array();

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

function results($idx){ //tree results build
    global $accs, $totals;
    if($accs[$idx]['ini_debe']+$accs[$idx]['ini_haber']+$accs[$idx]['per_debe']+$accs[$idx]['per_haber'] > 0){
        if($accs[$idx]['nivel']==1){
            $totals['ini_debe']+=(float)$accs[$idx]['ini_debe'];
            $totals['ini_haber']+=(float)$accs[$idx]['ini_haber'];
            $totals['per_debe']+=(float)$accs[$idx]['per_debe'];
            $totals['per_haber']+=(float)$accs[$idx]['per_haber'];
            $totals['fin_debe']+=(float)$accs[$idx]['fin_debe'];
            $totals['fin_haber']+=(float)$accs[$idx]['fin_haber'];
        }
        $accs[$idx]['ini_debe']=number_format($accs[$idx]['ini_debe'],2);
        $accs[$idx]['ini_haber']=number_format($accs[$idx]['ini_haber'],2);
        $accs[$idx]['per_debe']=number_format($accs[$idx]['per_debe'],2);
        $accs[$idx]['per_haber']=number_format($accs[$idx]['per_haber'],2);
        $accs[$idx]['fin_debe']=number_format($accs[$idx]['fin_debe'],2);
        $accs[$idx]['fin_haber']=number_format($accs[$idx]['fin_haber'],2);
        echo "<tr>".PHP_EOL;
        echo "<th>{$accs[$idx]['id']}</th>".PHP_EOL;
        echo "<td>".PHP_EOL;
        //echo str_repeat( "&nbsp;" , $accs[$idx]['nivel'] * 5 );
        echo $accs[$idx]['nombre'];
        echo "</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['ini_debe']}</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['ini_haber']}</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['per_debe']}</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['per_haber']}</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['fin_debe']}</td>".PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['fin_haber']}</td>".PHP_EOL;
        echo "</tr>".PHP_EOL;
        foreach($accs as $i => $acc)if($acc['padre']==$idx)results($i);
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
    if(!$json['success'])goto abort;

    //see if period to close opens exercice
    if($row['bid']==0)$periodOpenExercice=true;
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

    $db->StartTrans();
    if($periodCloseExercice){
        //generate close period entry

        $ttl=0; //total amount of close entry
        foreach($accs as $idx => $acc)if($acc['detalle'] && $idx != $folder['cuenta_cierre']){
            if($acc['fin_debe'] + $acc['fin_haber'] > 0){

                $accs[$idx]['per_haber'] += $accs[$idx]['fin_debe'];
                $accs[$idx]['per_debe'] += $accs[$idx]['fin_haber'];

                $ttl+=($accs[$idx]['fin_debe'] - $accs[$idx]['fin_haber']);
            }
        }
        if($ttl > 0){
            //exercice has utilities
            $accs[$folder['cuenta_cierre']]['per_haber'] += $ttl;
        }else{
            //exercice has losses
            $ttl=abs($ttl);
            $accs[$folder['cuenta_cierre']]['per_debe'] += $ttl;
        }

        //summarize again
        foreach($accs as $idx => $acc)if($acc['detalle'])summarize($idx);
    }

    $json['msg']='Balance cerrado sin incidentes';
}else{
    $json['success']=false;
    $json['msg']='Falta de permisos para realizar esta accion';
}

abort:
$json['debug']['accs']=$accs;
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
//echo json_encode($json, true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reporte de Prebalance</title>
</head>
<body>
<div class="container">
    <div class="page-header">
        <div class="row">
            <div class="col-md-6"><h1>Reporte de Prebalance</h1></div>
            <div class="col-md-3">
                <h3><small>Periodo:</small> <?php echo $period['nombre']?></h3>
            </div>
            <div class="col-md-3">
                <h3><small>Contabilidad:</small> <?php echo $folder['nombre']?></h3>
            </div>
        </div>
        <h4><?php echo $app->config('InstitName')?></h4>
    </div>
    <div class="table-responsive">
        <table align="center" width="95%" class="table table-striped table-condensed">
            <thead>
            <tr>
                <th rowspan="2" >No.</th>
                <th rowspan="2" >Nombre</th>
                <th colspan="2" class="text-right">Balance Inicial</th>
                <th colspan="2" class="text-right">Balance del periodo</th>
                <th colspan="2" class="text-right">Balance Final</th>
            </tr>
            <tr>
                <th class="text-right">Debe</th>
                <th class="text-right">Haber</th>
                <th class="text-right">Debe</th>
                <th class="text-right">Haber</th>
                <th class="text-right">Debe</th>
                <th class="text-right">Haber</th>
            </tr>
            </thead>
            <tbody>
<?php
foreach($accs as $idx => $acc)if(!$acc['padre'])results($idx);
?>
            </tbody>
            <tfoot>
            <tr>
                <th></th>
                <th>Totales:</th>
                <th class="text-right" ><?php echo number_format($totals['ini_debe'],2);?></th>
                <th class="text-right" ><?php echo number_format($totals['ini_haber'],2);?></th>
                <th class="text-right" ><?php echo number_format($totals['per_debe'],2);?></th>
                <th class="text-right" ><?php echo number_format($totals['per_debe'],2);?></th>
                <th class="text-right" ><?php echo number_format($totals['fin_debe'],2);?></th>
                <th class="text-right" ><?php echo number_format($totals['fin_debe'],2);?></th>
            </tr>
            </tfoot>
        </table>

    </div>
    <h4><?php echo $json['msg']; ?></h4>
    <!-- Bootstrap -->
    <link href="../libs/jscript/bstrap/css/bootstrap.min.css" rel="stylesheet">
</div>

<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="../libs/jscript/jquery-2.1.3.min.js"></script>
<!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="../libs/jscript/bstrap/js/bootstrap.min.js"></script>
</body>
</html>
