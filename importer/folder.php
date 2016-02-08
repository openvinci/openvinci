<?php require('shared.php');
$time_start = microtime(true);
$db=$app->conn[0];
$db->StartTrans();
//$db->debug=true;
$fle=ROOT."/importer/{$_POST['id']}";
$catalogId=$_POST['catalog'];

$contabs = $db->GetAll('SELECT * FROM tbl_contabilidad');
foreach($contabs as $k => $v){
    $ttable[$v['nombre']]=$v;
}
$tblFolder=zipTable($fle, 'SIS_CONFIG.txt');
if(is_array($tblFolder)){
    $json['success']=true;
    foreach($tblFolder as $row){
        $name=strtolower(pathinfo($fle, PATHINFO_FILENAME));
        $id=array_key_exists($name, $ttable);
        if(!$id){
            //$json['dbg']=$row;
            //$row['Cuenta_cierre']=preg_replace('/\D/','',$row['Cuenta_cierre']); //remove non decimal characters from account id
            $record['nombre']=$name;
            $record['tipo_cierre']=strtolower($row['Tipo_cierre']);
            $record['cuenta_cierre']=$row['Cuenta_cierre'];
            $record['catalogo']=$catalogId;
            $record['tipo_numeracion']=strtolower($row['Tipo_numeracion']);
            $record['prefijo_partida']=$row['Prefijo_partida'];
            $record['numero_partida']=(int)$row['Numero_partida'];
            $record['lugares_partida']=(int)$row['Lugares_partida'];
            if($row['Tipo_carpeta']=='Normal')$record['consolidada']=false;
            else $record['consolidada']=true;


            //TODO parte de presupuestos

            if($db->AutoExecute('tbl_contabilidad',$record,'INSERT')) {
                $cID = $db->Insert_ID(); //folder id to pass on

                if($record['consolidada']){
                    //if this is a consolidated folder, try to load origins
                    $tblOrigins=zipTable($fle, 'Sis_origenes.txt');
                    if(is_array($tblOrigins)){
                        foreach($tblOrigins as $rw){
                            $rc['contabilidad']=$cID;
                            $pth = strtolower(end(explode("\\",$rw['Ruta_carpeta'])));
                            $id=array_key_exists($pth, $ttable);
                            if($id){
                                $rc['origen']=$ttable[$pth]['id'];
                                if(!$db->AutoExecute('tbl_consolidados',$rc,'INSERT')){
                                    $json['success']=false;
                                    $json['msg']=$db->ErrorMsg();
                                    break;
                                };
                            }
                        }
                    }else{
                        $json['success']=false;
                        $json['msg']=$tblOrigins;
                    }
                }
                //if all ok, return account id
                if($json['success'])$json['msg']=$cID;
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }

        }else{
            $json['success']=false;
            $json['msg']='carpeta ya importada';
        }
    }
}else{
    $json['success']=false;
    $json['msg']=$tblFolder;
}

$db->CompleteTrans();
$json['time']=microtime(true)-$time_start;
$json['memory']=memory_get_peak_usage();
$json['memory'].=', '.memory_get_usage();
echo json_encode($json);
?>