<?php require('mail.php');
date_default_timezone_set('America/Guatemala');
error_reporting(E_ALL ^ E_NOTICE);

//$config=parse_ini_file('config.ini');
$config=json_decode(file_get_contents('config.json'), true);
//var_dump($config);

if($mbox = imap_open($config['account'], $config['user'], $config['pass'])){
    $list = imap_getmailboxes($mbox, "{imap.example.org}", "*");
    if (is_array($list))$json['debug']['mailboxes']=$list;

    if($mx=imap_num_msg($mbox)){

        $i=1;
        $header=imap_headerinfo($mbox,$i);
        $json['debug']['header']=$header;
        $referer=$header->fromaddress;
        $struc=imap_fetchstructure($mbox,$i);
        //seek for attachtments
        if(isset($struc->parts)){
            foreach ($struc->parts as $ind => $p){
                $json['debug']['partStruct'][]=$p;
                $part=imap_fetchbody($mbox,$i, $ind+1);
                if($p->encoding==4) $part = quoted_printable_decode($part);
                elseif ($p->encoding==3) $part = base64_decode($part);
                $json['debug']['part'][]=strlen($part);
                if(strtoupper($p->subtype)=="OCTET-STREAM"){
                    //this is a compressed zip
                    $g=tempnam('./','gz');
                    file_put_contents($g,$part);
                    $zip = new ZipArchive;
                    $res = $zip->open($g);
                    if ($res === TRUE) {
                        $zip->extractTo('../../');
                        $zip->close();
                    } else {
                        echo 'failed, code:' . $res;
                    }
                    unlink($g);
                }
            }
        }

        //read main content
        $json['debug']['body']=imap_fetchbody($mbox,$i,'1');
        $body=explode(PHP_EOL, imap_fetchbody($mbox,$i,'1'));
        $uuid=uniqid();
        $log="{$uuid}.log";
        foreach($body as $ln){
            $ln=trim($ln);
            switch(substr($ln,0,4)){
            case 'pge:':
                $url=str_replace('pge:','',trim($ln));
                $row=array('pge' => $url, 'to' => base64_encode($referer), "log" => $log);
                $json['data'][]=$row;
                break;
            case 'pic:':
                $url=str_replace('pic:','',trim($ln));
                $row=array('pic' => $url, 'to' => base64_encode($referer), "log" => $log);
                $json['data'][]=$row;
                break;
            case 'res:':
                $url=str_replace('res:','',trim($ln));
                $row=array('res' => $url, 'to' => base64_encode($referer), "log" => $log);
                $json['data'][]=$row;
                break;
            }

        }
        if($str = imap_errors()){
            mail($referer,'Errors processing', htmlspecialchars(var_export($str, true)));
            $json['msg']=$str;
        }
        imap_delete($mbox, 1);
        imap_expunge($mbox);
    }
    imap_close($mbox);
    $json['success']=true;
}else{ 
    $json['success']=false;
    $json['msg']=var_export(imap_errors(),true);
}

echo json_encode($json);
?>