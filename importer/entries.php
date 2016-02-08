<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];
$folderId=$_POST['folder'];

//loading period log
$period=array();
$handle = fopen('periodo.log', "r");
while (($data = fgetcsv($handle)) !== FALSE)if((int)$data[0])$period[$data[0]] = $data;
fclose($handle);

//loading books
$arr=$db->GetAll('SELECT * FROM tbl_libro');
foreach($arr as $a)$books[$a['nombre']]=$a;
unset($arr, $a);

//loading entry types
$arr=$db->GetAll('SELECT * FROM tbl_tipo_partida');
foreach($arr as $a)$entryTypes[$a['nombre']]=$a;
unset($arr, $a);

//loading markers
$arr=$db->GetAll("SELECT * FROM tbl_marcador WHERE contabilidad={$folderId}");
foreach($arr as $a)$markers[$a['nombre']]=$a;
unset($arr, $a);

//loading providers
$arr=$db->GetAll('SELECT * FROM tbl_proveedor');
foreach($arr as $a)$providers[metaphone($a['nombre'])]=$a;
unset($arr, $a);

//loading docTypes
$arr=$db->GetAll('SELECT * FROM tbl_tipo_documento');
foreach($arr as $a)$docTypes[metaphone($a['nombre'])]=$a;
unset($arr, $a);

$tblEntries=zipTable($fle, 'Partidas.txt');
if(is_array($tblEntries)){
    $tblEntryRows=zipTable($fle, 'Detpartidas.txt');
    if(is_array($tblEntryRows)){
        $json['success']=true;
        foreach($tblEntries as $entry){
            $record['contabilidad']=(int)$folderId;
            $record['libro']=(int)$books[$entry['Libro']]['id'];
            $record['periodo']=(int)$period[$entry['Idperiodo']]['1'];
            $record['fecha']=strtotime($entry['Fecha']);
            $record['tipo_partida']=(int)$entryTypes[$entry['Tipo_partida']]['id'];
            $record['numero_partida']=$entry['Numero_partida'];
            $record['referencia']=$entry['Referencia'];
            $record['concepto']=$entry['Concepto'];
            $record['valor']=(float)$entry['Total_debe'];
            if($entry['Anulada']=='F')$record['anulada']=false; else $record['anulada']=true;

            $json['debug_entry']=$entry;
            $json['debug_record']=$record;

            if(!$db->AutoExecute('tbl_partida',$record,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            }else{
                $cID=$db->Insert_ID( ); //entry id to pass on

                foreach($tblEntryRows as $entryRow)if($entryRow['Idpartida'] == $entry['Idpartida']){
                    $rec['partida']=$cID;
                    $rec['catalogo']=(int)$catalogId;
                    $rec['cuenta']=$entryRow['Idcuenta'];
                    $rec['concepto']=$entryRow['Concepto'];
                    $rec['debe']=(float)$entryRow['Debe'];
                    $rec['haber']=(float)$entryRow['Haber'];
                    $rec['marcador']=$markers[$entryRow['Marcador']]['id'];
                    $rec['proveedor']=$providers[metaphone($entryRow['Proveedor'])]['id'];
                    $rec['tipo_doc']=$docTypes[metaphone($entryRow['Tipodoc'])]['id'];
                    $rec['serie_doc']=$entryRow['Seriedoc'];
                    $rec['numero_doc']=$entryRow['Numdoc'];
                    $rec['fecha_doc']=strtotime($entryRow['Fechadoc']);
                    $rec['observaciones']=$entryRow['Observaciones'];

                    $json['debug_entryRow']=$entryRow;
                    $json['debug_recordRow']=$rec;

                    if(!$db->AutoExecute('tbl_partida_detalle',$rec,'INSERT')){
                        $json['success']=false;
                        $json['msg']=$db->ErrorMsg();
                        break 2;
                    }
                }
            }
        }
    }else{
        $json['success']=false;
        $json['msg']=$tblEntryRows;
    }
}else{
    $json['success']=false;
    $json['msg']=$tblEntries;
}


$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>