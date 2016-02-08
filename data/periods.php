<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
$tbl='tbl_periodo';
switch($act[0]){
    case 'create':
        if($app->acl(4)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);

            //see there is no overlaping in time for the new record
            $sql="SELECT ";
            $sql.="SUM(IF(DATE('{$record['inicio']}') BETWEEN p.inicio AND p.fin, 1, 0)) AS inicio, ";
            $sql.="SUM(IF(DATE('{$record['fin']}') BETWEEN p.inicio AND p.fin, 1, 0)) AS fin ";
            $sql.="FROM tbl_periodo AS p ";
            $intersections = $db->GetRow($sql);
            if(!$intersections['inicio'] && !$intersections['fin']){
                if($db->AutoExecute($tbl,$record,'INSERT')){
                    $json['success']=true;
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                }
            }else{
                $json['success']=false;
                $json['msg']='El rango de fechas del periodo se superpone con otro ya existente';
            }

        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'read':
        $json=array();
        $json['success']=true;
        $json['data']=array();

        if($_GET['filter']){
            $strFilter='';
            foreach(json_decode($_GET['filter'], true) as $i => $v){
                if($strFilter)$strFilter.=' AND ';
                $strFilter.=" {$v['property']} = {$v['value']}";
            }
            $strFilter="WHERE {$strFilter}";
        }else $strFilter='';

        $sql="SELECT * FROM {$tbl} {$strFilter}";
        $rs=$db->Execute($sql);

        while (!$rs->EOF) {
            $json['data'][]=$rs->fields;
            $rs->MoveNext();
        }
        break;
    case 'update':

        break;
    case 'destroy':
        if($app->acl(4)){
            $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
            if($rs) $json['success']=true; else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);
?>