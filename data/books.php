<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_libro';
switch($act[0]){
    case 'create':
        if($app->acl(21)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            $record['editable'] = true;
            if($db->AutoExecute($tbl,$record,'INSERT')){
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
    case 'read':
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
        if($app->acl(21)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if((bool)$record['editable']===false){
                $json['success']=false;
                $json['msg']='Este libro no es editable';
            }else
                if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]}")){
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
        if($app->acl(21)){
            $rw=$db->GetRow("SELECT * FROM {$tbl} WHERE id={$act[1]}");
            if((bool)$rw['editable']===false){
                $json['success']=false;
                $json['msg']='Este libro no es editable';
            }else{
                $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
                $json['success']=true;
            }
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);
?>