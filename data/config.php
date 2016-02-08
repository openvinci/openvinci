<?php  require('../core.php');
$act=explode('/',$_REQUEST['action']);
switch($act[0]){
    case 'read':
        if($app->acl(5)){
            $doc = simplexml_load_file(ROOT.'/config.xml');
            $json['success']=true;
            foreach($doc->site->config as $cfg){
                $type = (string) $cfg['type'];
                if(!$type)$type = 'string';
                $value =(string) $cfg;
                settype( $value, $type);
                $json['src'][(string)$cfg['id']]=$value;
                $json['display'][(string)$cfg['id']]=array('displayName'=>(string)$cfg['display']);
            }
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
    case 'write':
        if($app->acl(5)){
            $configs=json_decode(base64_decode($_REQUEST['src'], true));
            $doc = simplexml_load_file(ROOT.'/config.xml');
            $cnt=0;
            foreach($doc->site->config as $cfg) {
                foreach($configs as $i => $v){
                    if($i==(string)$cfg['id']){
                        $doc->site->config[$cnt] = $v;
                    }
                }
                $cnt++;
            }
            $json['success']=true;
            $doc->asXML(ROOT.'/config.xml');
        }else{
            $json['success']=false;
            $json['msg']='Falta de permisos para realizar esta accion';
        }
        break;
}
echo json_encode($json);