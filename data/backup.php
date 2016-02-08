<?php include('../core.php'); 
$act=explode('/',$_REQUEST['action']);
$path=ROOT.'/data/backups/';
$db=$app->conn[0];
//uniqid(time().'_')
switch($act[0]){
	case 'create':
		if($app->acl(6)){
			//$db->debug=true;
            $record = json_decode(html_entity_decode(file_get_contents('php://input'),ENT_COMPAT,'utf-8'),true);
			$time_start = microtime(true);
            $eNote=base64_encode($record['note']);
            if(!$eNote)$eNote=base64_encode(' - ');
			$fname=uniqid(time().'_')."_{$eNote}.sql";
			$file=$path.$fname;
			
			$fp = fopen($file, 'w');

$head=<<<EOT
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

EOT;
			fwrite($fp, $head);
			$arr=$db->MetaTables('TABLES');
			fclose($fp);
			foreach($arr as $tbl){
				$url='http://'.HOST."/backup.php?action=create_table/{$tbl}/{$fname}";
				$html=file_get_contents($url);	
			}
/*
			//structure recovery
			foreach($arr as $tbl)fwrite($fp, "DROP TABLE IF EXISTS `{$tbl}` CASCADE;".PHP_EOL);
			fwrite($fp, PHP_EOL);
			
			foreach($arr as $tbl){
				//$db->debug=true;
				$rs=$db->Execute("SHOW CREATE TABLE `{$tbl}`");
				$insertSQL=$rs->fields['Create Table'];
				fwrite($fp, $insertSQL.';'.PHP_EOL);
				fwrite($fp, PHP_EOL);
				
				$rs=$db->Execute("SELECT * FROM `{$tbl}`");
				$rows=$rs->GetArray();
				$rs=$db->Execute("SELECT * FROM `{$tbl}` WHERE 0>1");
				foreach($rows as $i=>$rec){
					$insertSQL=$db->GetInsertSQL($rs, $rec, get_magic_quotes_runtime(), true);
					$parts=explode('VALUES',$insertSQL);
					if($i % 100 ==0)fwrite($fp, $parts[0].'VALUES'.PHP_EOL);
					if($i % 100 ==99 || $i == count($rows)-1)fwrite($fp, $parts[1].';'.PHP_EOL);
					else fwrite($fp, $parts[1].','.PHP_EOL);
				}
				fwrite($fp, PHP_EOL);
				echo $tbl.'->'.microtime(true)-$time_start.'-'.memory_get_peak_usage(true).PHP_EOL;
			}
*/			
			//fclose($fp);
			$json['time']=microtime(true)-$time_start;
		}else{
			$json['success']=false;
			$json['msg']='lack of permits to perform the action';
		}
	break;
	//------------------------------------------------
	case 'create_table':
		$tbl=$act[1];
		$fname=$act[2];
		$file=$path.$fname;
		$fp = fopen($file, 'a+');
		fwrite($fp, "DROP TABLE IF EXISTS `{$tbl}` CASCADE;".PHP_EOL.PHP_EOL);
		
		$rs=$db->Execute("SHOW CREATE TABLE `{$tbl}`");
		$insertSQL=$rs->fields['Create Table'];
		fwrite($fp, $insertSQL.';'.PHP_EOL);
		fwrite($fp, PHP_EOL);
		$rs=$db->Execute("SELECT * FROM `{$tbl}`");
		$rows=$rs->GetArray();
		$rs=$db->Execute("SELECT * FROM `{$tbl}` WHERE 0>1");

		foreach($rows as $i=>$rec){
			$insertSQL=$db->GetInsertSQL($rs, $rec, get_magic_quotes_runtime(), true);
			$parts=explode('VALUES',$insertSQL);
			if($i % 100 ==0)fwrite($fp, $parts[0].'VALUES'.PHP_EOL);
			if($i % 100 ==99 || $i == count($rows)-1)fwrite($fp, $parts[1].';'.PHP_EOL);
			else fwrite($fp, $parts[1].','.PHP_EOL);
		}
		fwrite($fp, PHP_EOL);
		
		fclose($fp);
	break;
	//------------------------------------------------
	case 'read':
		if($app->acl(6)){
			$files = scandir($path);
			//print_r($files);
			foreach($files as $fle)if(is_file($path.$fle)){
				$size=filesize($path.$fle);
				$fle=pathinfo($fle,PATHINFO_FILENAME);
				$dta=explode('_',$fle);
				$rec=array('id' => $dta[1], 'note'=>base64_decode($dta[2]), 'tmstmp' => date('Y-m-d\TH:i:sP',(float)$dta[0]), 'size' => $size);
				$json['data'][]=$rec;
			}
		}else{
			$json['success']=false;
			$json['msg']='lack of permits to perform the action';
		}
	break;
	//------------------------------------------------
	case 'update':
		if($app->acl(7)){
			$files = scandir($path);
			foreach($files as $fle)if(is_file($path.$fle)){
				if(stristr($fle,$act[1])!==false){
					$rows=explode(';'.PHP_EOL,file_get_contents($path.$fle));
					//$db->debug=true;
                    foreach($rows as $row){
						$db->Execute($row);
					}
					$json['success']=true;
					break;
				}
			}
		}else{
			$json['success']=false;
			$json['msg']='lack of permits to perform the action';
		}
	break;
	//------------------------------------------------
	case 'destroy':
		if($app->acl(6)){
			$files = scandir($path);
			foreach($files as $fle)if(is_file($path.$fle)){
				if(stristr($fle,$act[1])!==false){
					unlink($path.$fle);
					$json['success']=true;
					break;
				}
			}
		}else{
			$json['success']=false;
			$json['msg']='lack of permits to perform the action';
		}
	break;
	//------------------------------------------------
}
echo json_encode($json);
?>