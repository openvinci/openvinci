<?php require('core.php'); ?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title><?php echo $app->config('siteName') ?></title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link rel='icon' sizes='196x196' href="style/imgs/icon196x196.png">
</head>
<link rel="stylesheet" type="text/css" href="ext/resources/ext-theme-neptune/ext-theme-neptune-all.css">
<link rel="stylesheet" type="text/css" href="style/main.css">
<body>
	<div class="loadingBox">Cargando<br/>por favor espere...</div>
</body>
<script src="data/libs/jscript/base64_decode.js"></script>
<script src="data/libs/jscript/base64_encode.js"></script>
<script src="ext/bootstrap.js"></script>
<script src="ext/locale/ext-lang-es.js"></script>
<script src="app.js"></script>
<script>
    //handpicked configurations to use on the client side
    var config=[];
    config['HOST']='<?php echo HOST ?>';
    config['siteName']='<?php echo $app->config('siteName') ?>';
    if(location.protocol == 'http:'){
        document.location.href="https://"+config['HOST'];
    }
</script>
</html>