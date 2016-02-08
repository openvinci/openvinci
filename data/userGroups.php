<?php  require('../core.php'); 
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
$tbl='tbl_users';
switch($act[0]){
    case 'create':
        if($app->acl(2)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            $record['type']=0;
            $record['active']=1;
            if($db->AutoExecute($tbl,$record,'INSERT')){
                $json['success']=true; 
                $id=$db->Insert_ID();
                if($record['permits'])foreach(explode(', ', $record['permits']) as $perm){
                    $rec=array('user'=>$id, 'permit'=>$perm);
                    $db->AutoExecute('tbl_user_permits',$rec,'INSERT');
                }
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
        }else{
            $json['success']=false;
            $json['msg']='lack of permits to perform the action';
        }
    break;
    case 'read':
        $json=array();
        if($app->acl(2)){
            $json['success']=true;
            $json['data']=array();

$sql=<<<eot
SELECT u.*, (
    SELECT GROUP_CONCAT(up.permit SEPARATOR ', ') 
    FROM tbl_user_permits AS up 
    WHERE u.id = up.user
    GROUP BY up.user
) AS permits 
FROM tbl_users AS u 
WHERE NOT u.type
ORDER BY u.type 
eot;

        $rs=$db->Execute($sql);

        while (!$rs->EOF) {
            $json['data'][]=$rs->fields;
            $rs->MoveNext();
        }
    }else{
        $json['success']=false;
        $json['msg']='lack of permits to perform the action';
    }
    break;
    case 'update':
        if($app->acl(2)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            $record['type']=0;
            $record['active']=1;
            if($db->AutoExecute($tbl,$record,'UPDATE',"id={$act[1]}")){
                //save permits
                $rs=$db->Execute("DELETE FROM tbl_user_permits WHERE user={$act[1]}");
                if($record['permits'])foreach(explode(', ', $record['permits']) as $perm){
                    $record=array('user'=>$act[1],'permit'=>$perm);
                    $db->AutoExecute('tbl_user_permits',$record,'INSERT');
                }
                $json['success']=true; 
            }else{
                $json['success']=false;
                $json['msg']=$db->ErrorMsg();
            }
        }else{
            $json['success']=false;
            $json['msg']='lack of permits to perform the action';
        }
    break;
    case 'destroy':
        if($app->acl(2)){
            $rs=$db->Execute("DELETE FROM tbl_user_permits WHERE user={$act[1]}");
            $rs=$db->Execute("DELETE FROM {$tbl} WHERE id={$act[1]}");
            $json['success']=true; 
        }else{
            $json['success']=false;
            $json['msg']='lack of permits to perform the action';
        }
    break;
}
echo json_encode($json);
?>