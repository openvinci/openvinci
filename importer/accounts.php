<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];

//adding account groups that don't exists
$groups = $db->GetAll('SELECT * FROM tbl_grupo');
foreach($groups as $k => $v){
    $ttable[metaphone($v['nombre'])]=$v;
}

//verify Groups
$tblGroups=zipTable($fle, 'Grupos.txt');
if(is_array($tblGroups)){
    $json['success']=true;
    foreach($tblGroups as $row){
        $id=array_key_exists(metaphone($row['Grupo']), $ttable);
        if(!$id){
            //this account group does not exists, insert
            $record['nombre']=$row['Grupo'];
            if($row['Tipo_saldo']=='Debe')$record['debe']=true; else $record['debe']=false;
            if($row['Modificable']=='F')$record['editable']=false; else $record['editable']=true;
            if(!$db->AutoExecute('tbl_grupo',$record,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            }
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblGroups;
}

if(!$json['success']){
    //end execution if something went wrong
    echo json_encode($json);
    exit();
}

//verify accounts
unset($ttable);
$groups = $db->GetAll('SELECT * FROM tbl_grupo'); //refresh to account for inserted
$accounts = $db->GetAll("SELECT * FROM tbl_cuenta WHERE catalogo={$catalogId}");
foreach($accounts as $k => $v){
    $ttable[$v['id']]=$v;
}

$tblAccounts=zipTable($fle, 'Cuentas.txt');
if(is_array($tblAccounts)){
    $json['success']=true;
    foreach($tblAccounts as $row){

        $id=array_key_exists($row['Idcuenta'], $ttable);
        if(!$id){
            $record['id']=$row['Idcuenta'];
            if(strpos($record['id'],'/')!==false){
                $json['success']=false;
                $json['msg']='el caracter "/" no puede usarse como separador en las cuentas';
                break;
            }
            $record['catalogo'] = $catalogId;
            $record['nombre']=$row['Nombre_cuenta'];
            if($row['Tipo_cuenta']=="Detalle")$record['detalle']=true; else $record['detalle']=false;
            $record['padre']=$row['Padre'];
            foreach($groups as $group){
                if(metaphone($row['Grupo']) == metaphone($group['nombre']))$record['grupo']=$group['id'];
            }
            $record['nivel']=(int)$row['Nivel'];
            //$json['debug'][]=$record;
            if(!$db->AutoExecute('tbl_cuenta',$record,'INSERT')){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
                break;
            }
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblAccounts;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>