<?php require('../../core.php');
$t=microtime(true);
$cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_in_memory_serialized;
PHPExcel_Settings::setCacheStorageMethod($cacheMethod);

$fle=ROOT."/data/export/accountTemplate.xlsx";
$objPHPExcel = PHPExcel_IOFactory::load($fle);
$db=$app->conn[0];

$catalog = $db->GetAll("SELECT * FROM tbl_cuenta");

$rw=8;

foreach($catalog as $key => $cuenta){
    $objPHPExcel->setActiveSheetIndex(0)
        ->setCellValue('A'.$rw, $cuenta['id'])
        ->setCellValue('B'.$rw, $cuenta['nombre'])
        ->setCellValue('C'.$rw, $cuenta['padre'])
        ->setCellValue('D'.$rw, $cuenta['detalle'])
        ->setCellValue('E'.$rw, $cuenta['grupo'])
        ->setCellValue('F'.$rw, $cuenta['nivel']);
    $rw++;
}

$grupos = $db->GetAll("SELECT * FROM tbl_grupo_balance");

$rw=8;

foreach($grupos as $key => $grupo){
    $objPHPExcel->setActiveSheetIndex(1)
        ->setCellValue('A'.$rw, $grupo['id'])
        ->setCellValue('B'.$rw, $grupo['nombre'])
        ->setCellValue('C'.$rw, $grupo['debe'])
        ->setCellValue('D'.$rw, $grupo['editable']);

    $rw++;
}

$objPHPExcel->getSecurity()->setLockWindows(true);
$objPHPExcel->getSecurity()->setLockStructure(true);
$objPHPExcel->getSecurity()->setWorkbookPassword("qwertyui");
//file_put_contents('security.txt',var_export($objPHPExcel->getSecurity()->getWorkbookPassword(),true));

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