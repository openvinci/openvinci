<?php require('../../core.php');
$time_start = microtime(true);
$db=$app->conn[0];
//$db->debug=true;
if($app->acl(13)){
    $fle=ROOT."/data/import/{$_FILES['catalogFile']['name']}";
    $catalogId=$_POST['catalogId'];

    $cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_in_memory_serialized;
    PHPExcel_Settings::setCacheStorageMethod($cacheMethod);

    if (move_uploaded_file($_FILES['catalogFile']['tmp_name'], $fle)) {
        $inputFileType = PHPExcel_IOFactory::identify($fle);
        if($inputFileType!='HTML'){
            $json['success']=true;
            $json['msg']='';

            $objReader = PHPExcel_IOFactory::createReader($inputFileType);
            $objReader->setReadDataOnly(true);
            $objPHPExcel = $objReader->load($fle);

            $groups = $objPHPExcel->getSheet(1);
            $accounts = $objPHPExcel->getSheet(0);

            $db->StartTrans();

            if($db->Execute('DELETE FROM tbl_cuenta')===false){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
            if($db->Execute('DELETE FROM tbl_grupo_balance')===false){
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }

            //import groups
            $rw=8;
            while($groups->getCell('A'.$rw)->getValue() && $json['success']){
                $record=array();
                $record['id']=(int)$groups->getCell('A'.$rw)->getValue();
                $record['catalogo']=$catalogId;
                $record['nombre']=(string)$groups->getCell('B'.$rw)->getValue();
                $record['debe']=(bool)$groups->getCell('C'.$rw)->getValue();
                $record['editable']=(bool)$groups->getCell('D'.$rw)->getValue();

                if($db->AutoExecute('tbl_grupo_balance',$record,'INSERT')){
                    $json['success']=true;
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                }
                $rw++;
            }
            //import accounts
            $rw=8;
            while($accounts->getCell('A'.$rw)->getValue() && $json['success']){
                $record=array();
                $record['id']=(int)$accounts->getCell('A'.$rw)->getValue();
                $record['nombre']=(string)$accounts->getCell('B'.$rw)->getValue();
                $record['padre']=(int)$accounts->getCell('C'.$rw)->getValue();
                $record['detalle']=(bool)$accounts->getCell('D'.$rw)->getValue();
                $record['grupo_balance']=(int)$accounts->getCell('E'.$rw)->getValue();
                $record['nivel']=(int)$accounts->getCell('F'.$rw)->getValue();

                if($db->AutoExecute('tbl_cuenta',$record,'INSERT')){
                    $json['success']=true;
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                }
                $rw++;
            }

            $db->CompleteTrans();
            $json['msg']='Todos los registros se importaron con exito';
        }else{
            $json['success']=false;
            $json['msg']='formato de archivo desconocido';
        }
        unlink($fle);
    }else{
        $json['success']=false;
        $json['msg']='Posible Ataque';
    }
}else {
    $json['success'] = false;
    $json['msg'] = 'Falta de permisos para realizar esta accion';
}

$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);