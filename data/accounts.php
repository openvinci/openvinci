<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_cuenta';
switch($act[0]){
    case 'create':
        if($app->acl(8)){
            $record = $_POST;
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
        if($app->acl(10)){
            $record = $_POST;
            if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]} AND catalogo={$act[2]}")){
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
        if($app->acl(11)){
            function recDelete($id, $catalog, $db, $tbl){
                $children = $db->GetAll("SELECT * FROM {$tbl} WHERE padre = {$id} AND catalogo = {$catalog}");
                foreach($children as $child)recDelete($child['id'], $catalog, $db, $tbl);
                $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$id} AND catalogo = {$catalog}");
                if($db->HasFailedTrans())$json['msg'][]=$db->ErrorMsg();
            }
            //$db->debug=true;
            $db->StartTrans();
            recDelete($act[1], $act[2], $db, $tbl);
            $db->CompleteTrans();

            if(count($json['msg'])){
                $json['success']=false;
            }else $json['success']=true;
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);
?>