<?php
/**
 * User: Michel Lopez H
 * Date: 24/11/2015
 * Time: 08:47 AM
 */
require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$sql=<<<SQL
SELECT COUNT(tp.concepto) AS c, tp.concepto AS nombre
FROM tbl_partida AS tp
WHERE tp.contabilidad ={$_REQUEST['id']}
GROUP BY SOUNDEX(SUBSTRING(tp.concepto,15))
HAVING c > 1
ORDER BY c DESC
SQL;

foreach($db->GetAll($sql) as $i => $v){
    $json['data'][]=array('id'=> $i+1, 'nombre' => $v['nombre'] );
}
$json['success']=true;
$json['debug']=$sql;
if(!count($json['data'])){
    $json['success']=false;
    $json['msg']=$db->ErrorMsg();

}
echo json_encode($json);
?>
