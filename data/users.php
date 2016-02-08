<?php require('../core.php');
$act=explode('/',$_REQUEST['action']);
$db=$app->conn[0];
$tbl='tbl_users';
switch($act[0]){
    case 'login':
        $sql="SELECT usr.*, tpe.name AS typeName ";
        $sql.="FROM {$tbl} AS usr Left Join {$tbl} AS tpe ON usr.type = tpe.id ";
        $sql.="WHERE usr.email='{$_REQUEST['email']}' AND usr.pass='{$_REQUEST['pass']}' AND usr.type > 0 AND usr.active";
        //$db->debug=true;
        $rs=$db->Execute($sql);
        if($rs->RecordCount()==1){
            $json['success']=true;
            //remove security fields
            unset($rs->fields['pass'], $rs->fields['active']);
            //get list of valid permits
            $sql="SELECT GROUP_CONCAT(permit SEPARATOR ', ')AS permits FROM tbl_user_permits WHERE user={$rs->fields['id']} GROUP BY user";
            $rs2=$db->Execute($sql);
            //set permits to user data
            $rs->fields['permits']='';
            if($rs2->RecordCount()==1)$rs->fields['permits']=$rs2->fields['permits'];
            //register user session
            $_SESSION['user']=$rs->fields;
            //send current user data
            $json['msg']=base64_encode(json_encode($rs->fields));
        }else{
            $json['success']=false;
            $json['msg']='combinacion de correo y contraseña no valida';
        }
    break;
    case 'logout':
        $json=array();
        unset($_SESSION['user']);
        $json['success']=true;
    break;
    case 'changepass':
        $json=array();
        if($app->acl()){
            $sql="SELECT pass FROM {$tbl} WHERE id={$_SESSION['user']['id']}";
            $rs=$db->Execute($sql);
            if($rs->fields['pass']==$_REQUEST['oldpass']){
                $_REQUEST['pass']=base64_decode($_REQUEST['pass']);
                if($db->AutoExecute($tbl,$_REQUEST,'UPDATE',"id={$_SESSION['user']['id']}")){
                    $json['success']=true;
                    $json['msg']='Cambio de contraseña completo';
                }else{
                    $json['success']=false;
                    $json['msg']=$db->ErrorMsg();;
                }
            }else{
                $json['success']=false;
                $json['msg']='Contaseña actual incorrecta, intentelo de nuevo';
            }
        }else{
            $json['success']=false;
            $json['msg']='Solicitud no valida, posible ataque, pruebe de nuevo';
        }
    break;
    case 'create':
        if($app->acl(1)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($record['active'])$record['active']=1; else $record['active']=0;
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
        if($app->acl(1)){
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
WHERE u.type
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
        if($app->acl(1)){
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
            if($record['active'])$record['active']=1; else $record['active']=0;
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
        if($app->acl(1)){
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