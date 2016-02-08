<?php  require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_contabilidad';
switch($act[0]){
    case 'create':
        if($app->acl(3)){
            $db->StartTrans();
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($record['tipo_numeracion']!='global'){
                unset($record['prefijo_partida'], $record['numero_partida'], $record['lugares_partida']);
            }
            if($db->AutoExecute($tbl,$record,'INSERT')){
                $json['success']=true;
                $cID=$db->Insert_ID( ); //folder id to pass it on

                //add default books to the folder
                $rec['contabilidad']=$cID;
                $rec['editable']=false;
                $rec['numero_partida']=1;
                $rec['lugares_partida']=4;

                $rec['nombre']='Bancos';
                $rec['tipo']='auxiliar';
                $rec['prefijo_partida']='PB';
                $db->AutoExecute('tbl_libro',$rec,'INSERT');

                $rec['nombre']='Diario general';
                $rec['tipo']='diario';
                $rec['prefijo_partida']='PD';
                $db->AutoExecute('tbl_libro',$rec,'INSERT');
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
            $db->CompleteTrans();
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'read':
        $json=array();
        $json['success']=true;
        $json['data']=array();
        //$db->debug=true;
        if($app->acl(3)) $filter=""; else $filter="WHERE uc.`user`={$_SESSION['user']['id']} ";
$sql = <<<SQL
SELECT c.*,
GROUP_CONCAT(uc.`user` SEPARATOR ', ') AS users,
GROUP_CONCAT(org.origen SEPARATOR ', ') AS origins
FROM {$tbl} AS c
LEFT JOIN tbl_user_contab AS uc ON uc.contabilidad = c.id
LEFT JOIN tbl_consolidados AS org ON org.contabilidad = c.id
{$filter}
GROUP BY c.id
SQL;
        $rs=$db->Execute($sql);
        while (!$rs->EOF) {
            $rs->fields['users']= array_map('intval', explode(',',$rs->fields['users']));
            $rs->fields['origins']= array_map('intval', explode(',',$rs->fields['origins']));
            $json['data'][] = $rs->fields;
            $rs->MoveNext();
        }
        break;
    case 'update':
        if($app->acl(3)){
            $db->StartTrans();
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($record['tipo_numeracion']!='global'){
                unset($record['prefijo_partida'], $record['numero_partida'], $record['lugares_partida']);
            }
            if(count($record['origins']))$record['consolidada']=true; else $record['consolidada']=false;
            if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]}")){

                //save asociated users
                $db->Execute("DELETE FROM tbl_user_contab WHERE contabilidad={$act[1]}");
                foreach($record['users'] as $item){
                    $rec=array();
                    $rec['contabilidad']=$act[1];
                    $rec['user']=$item;
                    $db->AutoExecute('tbl_user_contab',$rec,'INSERT');
                }

                //save asociated origins
                $db->Execute("DELETE FROM tbl_consolidados WHERE contabilidad={$act[1]}");
                foreach($record['origins'] as $item){
                    $rec=array();
                    $rec['contabilidad']=$act[1];
                    $rec['origen']=$item;
                    $db->AutoExecute('tbl_consolidados',$rec,'INSERT');
                }

                $json['success']=true;
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
            $db->CompleteTrans();
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'destroy':
        if($app->acl(3)){
            $db->StartTrans();
            if(!$json['msg'])$rs=$db->Execute("DELETE FROM tbl_user_contab WHERE contabilidad={$act[1]}");
            $json['msg']=$db->ErrorMsg();
            if(!$json['msg'])$rs=$db->Execute("DELETE FROM tbl_consolidados WHERE contabilidad={$act[1]}");
            $json['msg']=$db->ErrorMsg();
            if(!$json['msg'])$rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
            $json['msg']=$db->ErrorMsg();
            $db->CompleteTrans();
            if($json['msg']) $json['success']=false; else $json['success']=true;

        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);
?>