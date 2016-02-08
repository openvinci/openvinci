<?php require('../../core.php');
$time_start = microtime(true);
$db = $app->conn[0];
//$db->debug=true;
$accountId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$folderId = filter_input(INPUT_GET, 'folder', FILTER_VALIDATE_INT);

$folder=$db->GetRow("SELECT * FROM tbl_contabilidad WHERE id={$folderId}");
$account=$db->GetRow("SELECT * FROM tbl_cuenta WHERE id={$accountId} AND catalogo={$folder['catalogo']}");

$periods=array();
$totals=array();

$sql=<<<SQL
SELECT prd.nombre AS periodo,
p.fecha, tp.nombre AS tipo,
p.numero_partida, p.referencia,
pd.concepto,
pd.debe, pd.haber
FROM tbl_partida_detalle AS pd
Left Join tbl_partida AS p ON pd.partida = p.id
Left Join tbl_periodo AS prd ON p.periodo = prd.id
Left Join tbl_tipo_partida AS tp ON p.tipo_partida = tp.id
WHERE pd.cuenta = '{$accountId}'
AND p.contabilidad = {$folderId}
ORDER BY p.fecha ASC
SQL;

foreach($db->GetAll($sql) as $row){
    $periods[$row['periodo']][]=$row;
}

function results($idx, $entries){
    global $totals;
    //echo"".PHP_EOL;
    echo"<tbody>".PHP_EOL;

    echo"<tr>".PHP_EOL;
    echo"<th colspan='7'><h4><small>periodo: </small>{$idx}</h4></th>".PHP_EOL;
    echo"</tr>".PHP_EOL;

    $ttls=array();
    foreach($entries as $row){
        echo"<tr>".PHP_EOL;
        echo"<td>{$row['fecha']}</td>".PHP_EOL;
        echo"<td>{$row['tipo']}</td>".PHP_EOL;
        echo"<td>{$row['numero_partida']}</td>".PHP_EOL;
        echo"<td>{$row['referencia']}</td>".PHP_EOL;
        echo"<td>{$row['concepto']}</td>".PHP_EOL;
        echo"<td class='text-right'>".number_format($row['debe'],2)."</td>".PHP_EOL;
        echo"<td class='text-right'>".number_format($row['haber'],2)."</td>".PHP_EOL;
        echo"</tr>".PHP_EOL;
        $ttls['debe']+=(float)$row['debe'];
        $ttls['haber']+=(float)$row['haber'];
    }
    echo"<tr>".PHP_EOL;
    echo"<th colspan='5' class='text-right'>Total del periodo:</th>".PHP_EOL;
    echo"<th class='text-right'>".number_format($ttls['debe'],2)."</th>".PHP_EOL;
    echo"<th class='text-right'>".number_format($ttls['haber'],2)."</th>".PHP_EOL;
    echo"<tr>".PHP_EOL;
    $totals['debe']+=$ttls['debe'];
    $totals['haber']+=$ttls['haber'];
    echo"</tbody>".PHP_EOL;
}

$json['msg'] = ' ';

abort:
$json['time'] = microtime(true) - $time_start;
$json['memory'] = memory_get_peak_usage();
$json['memory'] .= ', ' . memory_get_usage();
//echo json_encode($json, true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Major de Cuentas</title>
</head>
<body>
<div class="container">
    <!-- begin document header -->
    <div class="page-header">
        <h4 class="text-center"><?php echo $app->config('InstitName') ?></h4>
        <h5 class="text-center">
            <small>Dirección:</small> <?php echo $app->config('direccion') ?></h5>
        <h5 class="text-center">
            <small>Teléfono:</small> <?php echo $app->config('telefono') ?></h5>
        <h5 class="text-center">
            <small>Email:</small> <?php echo $app->config('email') ?>
            <small>NIT:</small> <?php echo $app->config('NIT') ?></h5>
        <table width="100%">
            <tbody>
            <tr>
                <td width="30%">
                    <h1>Mayor de Cuentas</h1>
                </td>
                <td width="70%">
                    <h3><small>Cuenta: </small><?php echo "{$accountId} - {$account['nombre']}" ; ?></h3>
                    <h3><small>Contabilidad: </small><?php echo "{$folder['nombre']}" ; ?></h3>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
    <!-- end document header -->
    <div class="table-responsive">
        <table align="center" width="95%" class="table table-striped table-condensed">
            <thead>
            <tr>
                <th >Fecha</th>
                <th >Tipo</th>
                <th >No. de Partida</th>
                <th >Referencia</th>
                <th >Concepto</th>
                <th  class="text-right" >Debe</th>
                <th  class="text-right" >Haber</th>
            </tr>
            </thead>
            <?php
            foreach ($periods as $idx => $entries)results($idx, $entries);
            ?>
            <tfoot>
            <tr>
                <th ></th>
                <th ></th>
                <th ></th>
                <th ></th>
                <th >Total General</th>
                <th class="text-right"><?php echo number_format($totals['debe'],2);?></th>
                <th class="text-right"><?php echo number_format($totals['haber'],2);?></th>
            </tr>
            </tfoot>
        </table>

    </div>
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