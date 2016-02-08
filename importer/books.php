<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

$tblBooks=zipTable($fle, 'Libros.txt');
if(is_array($tblBooks)){
    $json['success']=true;
    $record['contabilidad']=$folderId;
    foreach($tblBooks as $row){
        $record['nombre'] = $row['Libro'];
        $record['tipo'] = strtolower($row['Tipo_libro']);
        if($row['Modificable']=='F')$record['editable']=false; else $record['editable']=true;
        $record['prefijo_partida'] = iconv('Windows-1252', "UTF-8", $row['Prefijo_partida']);
        $record['numero_partida'] =(int)$row['Numero_partida'];
        $record['lugares_partida'] =(int)$row['Lugares_partida'];

        if(!$db->AutoExecute('tbl_libro',$record,'INSERT')){
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
            break;
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblBooks;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>