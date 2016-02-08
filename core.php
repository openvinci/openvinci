<?php 
error_reporting(E_ERROR);
class core{
	public $conn=array();
	protected $config=''; //config object from xml
	protected $mtime=0;
	//------------------------------------------------------------	
	function __construct() {
        //start session
        session_start();

		$this->mtime=microtime(true);
    	define('ROOT', rtrim(dirname(__FILE__), '\\/'));
		define('HOST', rtrim(rtrim($_SERVER['HTTP_HOST'], '\\/') . dirname($_SERVER['PHP_SELF']), '\\/'));
		date_default_timezone_set('America/Guatemala');
		
		//dealing with utf-8
		ini_set('mbstring.internal_encoding', 'UTF-8');
		ini_set('mbstring.encoding_translation', 'On');

        //loading config data
        if (file_exists(ROOT.'/config.xml')) {
            $this->config = simplexml_load_file(ROOT.'/config.xml');
        } else {
            exit("Error abriendo {ROOT}/config.xml.");
        }

		//loading include files
		foreach($this->config->includes->fle as $inc){
			include_once(ROOT.'/'.(string)$inc); 
		}

		//creating conections
		$cnt=0;
		foreach($this->config->databases->db as $dbconn){
			$conn=array();
			$conn['driver']=(string)$dbconn['driver'];	//db driver
			$conn['server']=(string)$dbconn['server'];	//mysql server name
			$conn['database']=(string)$dbconn['database'];		//database
			$conn['user']=(string)$dbconn['user'];			//user to conect
			$conn['password']=(string)$dbconn['password'];	//password
			
			$dsn = "{$conn['driver']}://{$conn['user']}:{$conn['password']}@{$conn['server']}/{$conn['database']}?persist"; 
			$conn = NewADOConnection($dsn);
			if (!$conn) die("error, can't connect to database {$dsn}"); else{
				$conn->SetFetchMode(ADODB_FETCH_ASSOC);
				$conn->Execute('SET CHARACTER SET utf8');
			};
			$conn->fnExecute ='logCat';
			$this->conn[$cnt++]=$conn;
		}
   	}
	//------------------------------------------------------------
	//access global function
	function acl($permit=0){
		if($_SESSION['user']){
			if($permit){
				$arr=explode(', ', $_SESSION['user']['permits']);
				if(in_array($permit,$arr))return true; else return false;
			}else return true;
		}else return false;
	}
	//------------------------------------------------------------
	//seek config value function
	function config($value=''){
            if(!$value)return false; 
            foreach($this->config->site->config as $cfg){
                if($cfg['id']==$value){
                    $type = (string) $cfg['type'];
                    if(!$type)$type = 'string';
                    $value =(string) $cfg;
                    settype( $value, $type);
                    return $value;
                }
            }
	}
	//------------------------------------------------------------
	function __destruct() {
        //destroing connections
        foreach($this->conn as $conn)$conn->Close();

        //calculating execution time
        $this->mtime=microtime(true)-$this->mtime;
        //echo 'time: '.$this->mtime.' memory: '.(memory_get_peak_usage(true)/(1024*1024)).' Mb';
    }
}

//------------------------------------------------------------
//log activity function
function &logCat($db, $sql, $inputarray){
	global $app;
	if(is_array($inputarray)){
		//multiple sql querry, check all
		reset($inputarray);
	}else{
		//single sql query
		$inputarray[]=$sql;
	}

	$fp = fopen(ROOT.'/data/logCat.csv', 'a+');
	foreach($inputarray as $sqlstr){
		if(strripos($sqlstr,'insert ')!==false || strripos($sqlstr,'update ')!==false || strripos($sqlstr,'delete ')!==false){
			$dta=array(date('Y-m-d H:i:s'), $_SESSION['user']['name'], $sqlstr);
			fputcsv($fp, $dta);
		}
	}
	fclose($fp);

	# in PHP4.4 and PHP5, we need to return a value by reference
	$null = null;
	return $null;
}

if(!isset($app))$app=new core();
?>