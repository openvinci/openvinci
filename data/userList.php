<?php require('../core.php');
$db=$app->conn[0];
$tbl='tbl_users';
$json['success']=true;
$sql=<<<SQL
SELECT u.id, u.`name` FROM tbl_users AS u WHERE type > 0
SQL;
$json['data']=$db->GetAll($sql);
echo json_encode($json);