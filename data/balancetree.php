<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
//$db->debug=true;
$tbl='tbl_cuenta';
if($app->acl(37)) {
    if (!$_GET['balance']) exit('{success:false, msg:no se ha elegido un balance}');

    $sql = <<<SQL
SELECT c.*,
bd.ini_debe, bd.ini_haber,
bd.per_debe, bd.per_haber,
bd.fin_debe, bd.fin_haber
FROM {$tbl} AS c
LEFT JOIN tbl_balance_detalle AS bd ON bd.cuenta = c.id
WHERE bd.balance={$_GET['balance']}
SQL;

    $accounts = $db->GetAll($sql);

    $json = array('text' => '.', 'expanded' => true, 'children' => array());

    $totals=array();
    function build($accounts, $node){
        global $totals;
        $children = array();
        $cnt = 0;
        foreach ($accounts as $account) {
            if ($account['padre'] == $node) {
                $children[$cnt] = $account;
                $children[$cnt]['children'] = build($accounts, $account['id']);
                if($children[$cnt]['nivel']==1){
                    $totals['ini_debe']+=$children[$cnt]['ini_debe'];
                    $totals['ini_haber']+=$children[$cnt]['ini_haber'];
                    $totals['per_debe']+=$children[$cnt]['per_debe'];
                    $totals['per_haber']+=$children[$cnt]['per_haber'];
                    $totals['fin_debe']+=$children[$cnt]['fin_debe'];
                    $totals['fin_haber']+=$children[$cnt]['fin_haber'];
                }
                $cnt++;
            }
        }
        return $children;
    }

    $json['children'] = build($accounts, 0);
    $totals['id']='';
    $totals['padre']=0;
    $totals['nombre']='TOTALES';
    $totals['detalle']=true;
    $totals['grupo']=1;
    $totals['nivel']=1;
    $json['children'][count($json['children'])]=$totals;
}else{
    $json['success']=false;
    $json['msg']='Falta de permisos para realizar esta accion';
}
echo json_encode($json);
?>