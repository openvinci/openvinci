<?php
function multi_attach_mail($to, $subject, $message, $files, $sendermail){
   // email fields: to, from, subject, and so on
   $from = "<".$sendermail.">"; 
   $headers = "From: $from";
  
   // boundary 
   $semi_rand = md5(time()); 
   $mime_boundary = "==Multipart_Boundary_x{$semi_rand}x"; 
  
   // headers for attachment 
   $headers .= "\nMIME-Version: 1.0\n" . "Content-Type: multipart/mixed;\n" . " boundary=\"{$mime_boundary}\""; 
  
   // multipart boundary 
   $message = "--{$mime_boundary}\n" . "Content-Type: text/html; charset=\"utf-8\"\n" .
   "Content-Transfer-Encoding: 7bit\n\n" . $message . "\n\n"; 
  
   // preparing attachments
   for($i=0;$i<count($files);$i++){
	   if(is_file($files[$i])){
		   $message .= "--{$mime_boundary}\n";
		   $fp =    @fopen($files[$i],"rb");
	   $data =    @fread($fp,filesize($files[$i]));
				   @fclose($fp);
		   $data = chunk_split(base64_encode($data));
		   $message .= "Content-Type: application/octet-stream; name=\"".basename($files[$i])."\"\n" . 
		   "Content-Description: ".basename($files[$i])."\n" .
		   "Content-Disposition: attachment;\n" . " filename=\"".basename($files[$i])."\"; size=".filesize($files[$i]).";\n" . 
		   "Content-Transfer-Encoding: base64\n\n" . $data . "\n\n";
		   }
	   }
   $message .= "--{$mime_boundary}--";
   $returnpath = "-f" . $sendermail;
   $ok = mail($to, $subject, $message, $headers, $returnpath); 
   if($ok){ return $i; } else { return 0; }
}
?>