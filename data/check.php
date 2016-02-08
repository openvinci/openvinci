<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_partida';
switch($act[0]){
    case 'create':
        if($app->acl(25)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            $record['valor']=$record['haber'];
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

                //save account detail record
                $rec['partida'] = $json['msg'];
                $rec['catalogo'] = $record['catalogo'];
                $rec['cuenta'] = $record['cuenta'];
                $rec['debe'] = 0;
                $rec['haber'] = 0;

                if($db->AutoExecute('tbl_partida_detalle',$rec, "INSERT")){
                    //$json['debug']['detail']=$db->Insert_ID( );
                    $json['success']=true;
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                }
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
                //if($strFilter)$strFilter.=' AND ';
                $strFilter.=' AND ';
                $strFilter.=" {$v['property']} = {$v['value']}";
            }
            //$strFilter="WHERE {$strFilter}";
        }else $strFilter='';

        $sql = "SELECT p.*,
        pd.id AS entryId, pd.catalogo, pd.cuenta, pd.concepto AS e_concepto, pd.debe, .pd.haber,
        pd.marcador, pd.proveedor, pd.tipo_doc, pd.serie_doc, pd.numero_doc, pd.fecha_doc, pd.observaciones
        FROM {$tbl} AS p
        LEFT JOIN {$tbl}_detalle AS pd ON p.id = pd.partida
        WHERE (pd.haber - pd.debe) >= 0
        {$strFilter}";
        $rs = $db->Execute($sql);
        //$json['sql']=$sql;
        while (!$rs->EOF) {
            $json['data'][] = $rs->fields;
            $rs->MoveNext();
        }
        break;
    case 'update':
        if($app->acl(27)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            $record['valor']=$record['haber'];
            if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]}")){
                $json['success']=true;

                //save account record
                $rec['partida'] = $act[1];
                $rec['catalogo'] = $record['catalogo'];
                $rec['cuenta'] = $record['cuenta'];
                $rec['concepto'] = $record['e_concepto'];
                $rec['haber'] = $record['haber'];
                $rec['debe'] = 0;

                if($db->AutoExecute('tbl_partida_detalle',$rec, "UPDATE", "id = {$record['entryId']}")){
                    $json['success']=true;
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();
                }
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
        if($app->acl(28)){
            $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
            $json['success']=true;
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);
?>