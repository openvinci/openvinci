<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_partida';
switch($act[0]){
    case 'create':
        if($app->acl(15)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($db->AutoExecute($tbl,$record,'INSERT')){
                $json['success']=true;
                $json['msg']=$db->Insert_ID( );
                //get folder data
                $folder=$db->GetRow("SELECT * FROM tbl_contabilidad WHERE id={$record['contabilidad']}");
                if($folder['tipo_numeracion']=='global'){
                    //update consecutive on folder
                    $sql="UPDATE tbl_contabilidad SET numero_partida = numero_partida + 1 WHERE id={$record['contabilidad']}";
                } else{
                    //update consecutive on book
                    $sql="UPDATE tbl_libro SET numero_partida = numero_partida + 1 WHERE id={$record['libro']}";
                }
                $db->Execute($sql);
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case "read":
        $json = array();
        $json['success'] = true;
        $json['data'] = array();

        if($_GET['filter']){
            $strFilter='';
            foreach(json_decode($_GET['filter'], true) as $i => $v){
                if($strFilter)$strFilter.=' AND ';
                $strFilter.=" {$v['property']} = {$v['value']}";
            }
            $strFilter="WHERE {$strFilter}";
        }else $strFilter='';

        $sql = "SELECT * FROM {$tbl} {$strFilter}";
        $rs = $db->Execute($sql);

        while (!$rs->EOF) {
            $json['data'][] = $rs->fields;
            $rs->MoveNext();
        }
        break;
    case 'update':
        if($app->acl(17)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]}")){
                $db->Execute("UPDATE {$tbl} AS p SET p.valor=(SELECT SUM(pd.debe) FROM tbl_partida_detalle AS pd WHERE pd.partida=p.id) WHERE id={$record['id']}");
                $json['success']=true;
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'destroy':
        if($app->acl(18)){
            $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
            $json['success']=true;
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'lastentry':
        $sql="SELECT libro, periodo FROM tbl_partida WHERE contabilidad = {$act[1]} ORDER BY id DESC";
        $rw=$db->GetRow($sql);
        if($rw){
            $json['success']=true;
            $json['libro']=(int)$rw['libro'];
            $json['periodo']=(int)$rw['periodo'];
        }else{
            $json['success']=false;
            $json['msg']=$db->ErrorMsg();
        }

        break;
}
echo json_encode($json);
?>