<?php require('../../core.php');
$time_start = microtime(true);
$db = $app->conn[0];
//$db->debug=true;
$balanceId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

$cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_in_memory_serialized;
PHPExcel_Settings::setCacheStorageMethod($cacheMethod);

$fle=ROOT."/data/reports/balance.xlsx";
$objPHPExcel = PHPExcel_IOFactory::load($fle);

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
    global $accs, $totals, $rw, $objPHPExcel;
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

        $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A'.$rw, $accs[$idx]['id'])
            ->setCellValue('B'.$rw, $accs[$idx]['nombre'])
            ->setCellValue('C'.$rw, $accs[$idx]['ini_debe'])
            ->setCellValue('D'.$rw, $accs[$idx]['ini_haber'])
            ->setCellValue('E'.$rw, $accs[$idx]['per_debe'])
            ->setCellValue('F'.$rw, $accs[$idx]['per_haber'])
            ->setCellValue('G'.$rw, $accs[$idx]['fin_debe'])
            ->setCellValue('H'.$rw, $accs[$idx]['fin_haber']);
        $rw++;
        foreach ($accs as $i => $acc) if ($acc['padre'] == $idx) results($i);

    }
}

$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('A2', $app->config('InstitName'))
    ->setCellValue('A3', 'Dirección: '.$app->config('direccion'))
    ->setCellValue('A4', 'Teléfono: '.$app->config('telefono'))
    ->setCellValue('A5','Email: '.$app->config('email'). ' NIT: '.$app->config('NIT'))
    ->setCellValue('D6', $balance['inicio'])
    ->setCellValue('G6', $balance['fin']);

$rw=10;
foreach ($accs as $idx => $acc) if (!$acc['padre']) results($idx);

$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('A'.$rw, '')
    ->setCellValue('B'.$rw, 'Totales:')
    ->setCellValue('C'.$rw, $totals['ini_debe'])
    ->setCellValue('D'.$rw, $totals['ini_haber'])
    ->setCellValue('E'.$rw, $totals['per_debe'])
    ->setCellValue('F'.$rw, $totals['per_haber'])
    ->setCellValue('G'.$rw, $totals['fin_debe'])
    ->setCellValue('H'.$rw, $totals['fin_haber']);

$styleArray = array(
    'borders' => array(
        'allborders' => array('style' => PHPExcel_Style_Border::BORDER_THIN,'color' => array('argb' => 'FF3333333')),
    ),
);
$objPHPExcel->setActiveSheetIndex(0)->getStyle('A10:H'.$rw)->applyFromArray($styleArray);
$styleArray = array('font' => array('bold' => true));
$objPHPExcel->setActiveSheetIndex(0)->getStyle('A'.$rw.':H'.$rw)->applyFromArray($styleArray);

$rw+=4;

$styleArray = array(
    'font' => array('bold' => true),
    'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER)
);
$objPHPExcel->setActiveSheetIndex(0)->getStyle('A'.$rw.':H'.($rw + 20))->applyFromArray($styleArray);

$styleArray = array(
    'borders' => array(
        'bottom' => array('style' => PHPExcel_Style_Border::BORDER_THIN,'color' => array('argb' => 'FF000000'))
    )
);
$objPHPExcel->setActiveSheetIndex(0)->getStyle('B'.$rw)->applyFromArray($styleArray);
$objPHPExcel->setActiveSheetIndex(0)->getStyle('E'.$rw.':G'.$rw)->applyFromArray($styleArray);
$rw++;
$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('B'.$rw, $balance['firma1'])
    ->setCellValue('F'.$rw, $balance['firma2']);
$rw++;
$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('B'.$rw, $balance['cargo1'])
    ->setCellValue('F'.$rw, $balance['cargo2']);
$rw+=4;

$objPHPExcel->setActiveSheetIndex(0)->getStyle('B'.$rw)->applyFromArray($styleArray);
$objPHPExcel->setActiveSheetIndex(0)->getStyle('E'.$rw.':G'.$rw)->applyFromArray($styleArray);
$rw++;
$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('B'.$rw, $balance['firma3'])
    ->setCellValue('F'.$rw, $balance['firma4']);
$rw++;
$objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('B'.$rw, $balance['cargo3'])
    ->setCellValue('F'.$rw, $balance['cargo4']);

//writing output
$fId=uniqid();
// Redirect output to a client's web browser (Excel2007)
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment;filename=catalog_{$fId}.xlsx");
header('Cache-Control: max-age=0');

$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
$objWriter->save('php://output');

$t=microtime(true)-$t;
$m=memory_get_peak_usage(true);
$st="memory: {$m} time: {$t}";
file_put_contents('stats.txt',$st);
?>