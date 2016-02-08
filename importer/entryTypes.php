<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];

//adding entry types that don't exists
$groups = $db->GetAll('SELECT * FROM tbl_tipo_partida');
foreach($groups as $k => $v){
    $ttable[$v['nombre']]=$v;
}

//verify entry types
$tblGroups=zipTable($fle, 'Listatpa.txt');
if(is_array($tblGroups)){
    $json['success']=true;
    foreach($tblGroups as $row){
        $id=array_key_exists($row['Tipo_partida'], $ttable);
        if(!$id){
            //this account group does not exists, insert
            $record['nombre']=$row['Tipo_partida'];
            $record['descrip']=$row['Tipo_partida'];
            if($row['Modificable']=='F')$record['editable']=false; else $record['editable']=true;
            if(!$db->AutoExecute('tbl_tipo_partida',$record,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            }else{
                $ttable[$record['nombre']]=$record;
            }
        }
    }
    $tblEntries=zipTable($fle, 'Partidas.txt');
    if(is_array($tblEntries)){
        foreach($tblEntries as $entry){
            $id=array_key_exists($entry['Tipo_partida'], $ttable);
            //this account group does not exists, insert
            if(!$id){
                $record['nombre']=$entry['Tipo_partida'];
                $record['descrip']=$entry['Tipo_partida'];
                $record['editable']=true;
                if(!$db->AutoExecute('tbl_tipo_partida',$record,'INSERT')){
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                    break;
                }else{
                    $ttable[$record['nombre']]=$record;
                }
            }
        }
    }else{
        $json['success']=false;
        $json['msg']=$tblEntries;
    }
}else{
    $json['success']=false;
    $json['msg']=$tblGroups;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>