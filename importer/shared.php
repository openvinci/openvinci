<?php require('../core.php');
function zipTable($fileName, $tableName){
    $zip = new ZipArchive;
    $res = $zip->open($fileName);
    if ($res === TRUE) {
        $ind = $zip->locateName( $tableName , ZipArchive::FL_NODIR );
        if($ind!==false){
            file_put_contents($tableName, $zip->getFromIndex($ind));
            $handle = fopen($tableName, "r");
            $table=array();
            while (($row = fgetcsv($handle)) !== FALSE){
                if(isset($headers)){
                    if(ord($row[0])==26)break; //EOL of the ANSI paradox file, AVOID!!!!!!
                    //content, generate row array
                    $trow=array();
                    foreach($row as $i => $v){
                        $trow[$headers[$i]]=iconv('Windows-1252', "UTF-8//TRANSLIT", $v);
                    }
                    $table[]=$trow;
                }else{
                    //first row, get column names
                    foreach($row as $i => $v){
                        $headers[$i] = $v;
                    }
                }
            }
            fclose($handle);
            unlink($tableName);
            return $table;
        }else{
            return "No se Encontró la tabla {$tableName} en el archivo";
        }
    }else{
        return 'No se Encontró el archivo';
    }
}