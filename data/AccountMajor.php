<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;

$sql=<<<SQL
SELECT
p.id,
prd.id AS prdId,
p.libro AS bookId,
prd.nombre AS peridodo,
p.fecha,
p.numero_partida,
tp.nombre AS tipo_partida,
p.referencia,
pd.concepto,
SUM(pd.debe) AS debe,
SUM(pd.haber) AS haber
FROM
tbl_partida_detalle AS pd
Left Join tbl_partida AS p ON pd.partida = p.id
Left Join tbl_periodo AS prd ON p.periodo = prd.id
Left Join tbl_tipo_partida AS tp ON p.tipo_partida = tp.id
WHERE
pd.cuenta = '{$_GET['id']}'
GROUP BY p.id
SQL;

foreach($db->GetAll($sql) as $i => $v){
    $json['data'][]=$v;
}
$json['success']=true;
//$json['debug']=$sql;
if(!count($json['data'])){
$json['success']=false;
$json['msg']=$db->ErrorMsg();

}
echo json_encode($json);
?>