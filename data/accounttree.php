<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_cuenta';

$accounts=$db->GetAll("SELECT * FROM {$tbl} WHERE catalogo = {$_REQUEST['catalogo']}");

$json=array('text'=>'.', 'expanded'=>true, 'children'=>array());

function build($accounts, $node){
    $children = array();
    $cnt=0;
    foreach($accounts as $account){
        if($account['padre'] == $node){
            $children[$cnt]=$account;
            $children[$cnt]['children']=build($accounts, $account['id']);
            $cnt++;
        }
    }
    return $children;
}
$json['children'] = build($accounts, 0);
echo json_encode($json);
?>