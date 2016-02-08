<?php require('../../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
//$db->debug=true;
$balanceId=filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

$url='http://'.HOST."/balance.php?id={$balanceId}";
$html=file_get_contents($url);

$mpdf=new mPDF('utf-8', 'A4-L');
$mpdf->WriteHTML($html);
$mpdf->Output();
