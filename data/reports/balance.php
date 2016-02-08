<?php require('../../core.php');
$time_start = microtime(true);
$db = $app->conn[0];
//$db->debug=true;
$balanceId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

$sql = <<<SQL
SELECT p.nombre AS periodo, p.inicio, p.fin,
c.nombre AS contabilidad,
c.firma1, c.cargo1,
c.firma2, c.cargo2,
c.firma3, c.cargo3,
c.firma4, c.cargo4
FROM tbl_balance AS b
Left Join tbl_periodo AS p ON b.periodo = p.id
Left Join tbl_contabilidad AS c ON b.contabilidad = c.id
WHERE b.id = {$balanceId}
SQL;
$balance = $db->GetRow($sql);

$accs = array();

$sql = <<<SQL
SELECT
c.id, c.padre, c.nivel, c.nombre,
bd.ini_debe, bd.ini_haber,
bd.per_debe, bd.per_haber,
bd.fin_debe, bd.fin_haber
FROM
tbl_balance_detalle AS bd
Left Join tbl_cuenta AS c ON bd.catalogo = c.catalogo AND bd.cuenta = c.id
WHERE bd.balance = {$balanceId}
SQL;

foreach ($db->GetAll($sql) as $idx => $v) {
    $accs[$v['id']] = $v;
}

$totals = array();

function results($idx)
{ //tree results build
    global $accs, $totals;
    if ($accs[$idx]['ini_debe'] + $accs[$idx]['ini_haber'] + $accs[$idx]['per_debe'] + $accs[$idx]['per_haber'] > 0) {
        if ($accs[$idx]['nivel'] == 1) {
            $totals['ini_debe'] += (float)$accs[$idx]['ini_debe'];
            $totals['ini_haber'] += (float)$accs[$idx]['ini_haber'];
            $totals['per_debe'] += (float)$accs[$idx]['per_debe'];
            $totals['per_haber'] += (float)$accs[$idx]['per_haber'];
            $totals['fin_debe'] += (float)$accs[$idx]['fin_debe'];
            $totals['fin_haber'] += (float)$accs[$idx]['fin_haber'];
        }
        $accs[$idx]['ini_debe'] = number_format($accs[$idx]['ini_debe'], 2);
        $accs[$idx]['ini_haber'] = number_format($accs[$idx]['ini_haber'], 2);
        $accs[$idx]['per_debe'] = number_format($accs[$idx]['per_debe'], 2);
        $accs[$idx]['per_haber'] = number_format($accs[$idx]['per_haber'], 2);
        $accs[$idx]['fin_debe'] = number_format($accs[$idx]['fin_debe'], 2);
        $accs[$idx]['fin_haber'] = number_format($accs[$idx]['fin_haber'], 2);
        echo "<tr>" . PHP_EOL;
        echo "<th>{$accs[$idx]['id']}</th>" . PHP_EOL;
        echo "<td>" . PHP_EOL;
        //echo str_repeat( "&nbsp;" , $accs[$idx]['nivel'] * 5 );
        echo $accs[$idx]['nombre'];
        echo "</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['ini_debe']}</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['ini_haber']}</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['per_debe']}</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['per_haber']}</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['fin_debe']}</td>" . PHP_EOL;
        echo "<td align='right' >{$accs[$idx]['fin_haber']}</td>" . PHP_EOL;
        echo "</tr>" . PHP_EOL;
        foreach ($accs as $i => $acc) if ($acc['padre'] == $idx) results($i);

    }
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
    <title>Balance de periodo</title>
</head>
<body>
<div class="container-fluid">
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
                <td width="50%">
                    <h1>Balance de Periodo</h1>
                </td>
                <td width="25%">
                    <h3><small>Desde:</small> <?php echo $balance['inicio']; ?></h3>
                </td>
                <td width="25%">
                    <h3><small>Hasta:</small> <?php echo $balance['fin']; ?></h3>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
    <!-- end document header -->
    <div class="table-responsive">
        <table align="center" width="95%" class="table table-striped table-bordered">
            <thead>
            <tr>
                <th rowspan="2">No.</th>
                <th rowspan="2">Nombre</th>
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
            foreach ($accs as $idx => $acc) if (!$acc['padre']) results($idx);
            ?>
            </tbody>
            <tfoot>
            <tr>
                <th></th>
                <th>Totales:</th>
                <th class="text-right"><?php echo number_format($totals['ini_debe'], 2); ?></th>
                <th class="text-right"><?php echo number_format($totals['ini_haber'], 2); ?></th>
                <th class="text-right"><?php echo number_format($totals['per_debe'], 2); ?></th>
                <th class="text-right"><?php echo number_format($totals['per_debe'], 2); ?></th>
                <th class="text-right"><?php echo number_format($totals['fin_debe'], 2); ?></th>
                <th class="text-right"><?php echo number_format($totals['fin_debe'], 2); ?></th>
            </tr>
            </tfoot>
        </table>

    </div>
    <!-- begin document signature -->
    <table width="100%">
        <tbody>
            <tr>
                <td width="8%"></td>
                <td width="32%" class="text-center <?php if (!$balance['firma1']) echo 'hidden'; ?>">
                    <br/><br/><hr/>
                    <h4><?php echo $balance['firma1']; ?><br/>
                        <small><?php echo $balance['cargo1']; ?></small>
                    </h4>
                </td>
                <td width="16%"></td>
                <td width="32%" class="text-center <?php if (!$balance['firma2']) echo 'hidden'; ?>">
                    <br/><br/><hr/>
                    <h4><?php echo $balance['firma2']; ?><br/>
                        <small><?php echo $balance['cargo2']; ?></small>
                    </h4>
                </td>
                <td width="8%"></td>
            </tr>
            <tr>
                <td width="8%"></td>
                <td width="32%" class="text-center <?php if (!$balance['firma3']) echo 'hidden'; ?>">
                    <br/><br/><hr/>
                    <h4><?php echo $balance['firma3']; ?><br/>
                        <small><?php echo $balance['cargo3']; ?></small>
                    </h4>
                </td>
                <td width="16%"></td>
                <td width="32%" class="text-center <?php if (!$balance['firma4']) echo 'hidden'; ?>">
                    <br/><br/><hr/>
                    <h4><?php echo $balance['firma4']; ?><br/>
                        <small><?php echo $balance['cargo4']; ?></small>
                    </h4>
                </td>
                <td width="8%"></td>
            </tr>
        </tbody>
    </table>
    <!-- end document signature -->
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
