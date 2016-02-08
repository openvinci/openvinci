<?php
/**
 * Resolve a URL relative to a base path. This happens to work with POSIX
 * filenames as well. This is based on RFC 2396 section 5.2.
 */
function resolve_url($base, $url) {
    if (!strlen($base)) return $url;
    // Step 2
    if (!strlen($url)) return $base;
    // Step 3
    if (preg_match('!^[a-z]+:!i', $url)) return $url;
    $base = parse_url($base);
    $base['host']=rtrim($base['host'],'_');
    if ($url{0} == "#") {
        // Step 2 (fragment)
        $base['fragment'] = substr($url, 1);
        return unparse_url($base);
    }
    unset($base['fragment']);
    unset($base['query']);
    if (substr($url, 0, 2) == "//") {
        // Step 4
        return glue_url(array(
            'scheme'=>$base['scheme'],
            'path'=>substr($url,2),
        ));
    } else if ($url{0} == "/") {
        // Step 5
        $base['path'] = $url;
    } else {
        // Step 6
        $path = explode('/', $base['path']);
        $url_path = explode('/', $url);
        // Step 6a: drop file from base
        array_pop($path);
        // Step 6b, 6c, 6e: append url while removing "." and ".." from
        // the directory portion
        $end = array_pop($url_path);
        foreach ($url_path as $segment) {
            if ($segment == '.') {
                // skip
            } else if ($segment == '..' && $path && $path[sizeof($path)-1] != '..') {
                array_pop($path);
            } else {
                $path[] = $segment;
            }
        }
        // Step 6d, 6f: remove "." and ".." from file portion
        if ($end == '.') {
            $path[] = '';
        } else if ($end == '..' && $path && $path[sizeof($path)-1] != '..') {
            $path[sizeof($path)-1] = '';
        } else {
            $path[] = $end;
        }
        // Step 6h
        $base['path'] = join('/', $path);

    }
    // Step 7
    return glue_url($base);
}
//--------------------------------
function glue_url($parsed) {
    if (!is_array($parsed)) {
        return false;
    }

    $uri = isset($parsed['scheme']) ? $parsed['scheme'].':'.((strtolower($parsed['scheme']) == 'mailto') ? '' : '//') : '';
    $uri .= isset($parsed['user']) ? $parsed['user'].(isset($parsed['pass']) ? ':'.$parsed['pass'] : '').'@' : '';
    $uri .= isset($parsed['host']) ? $parsed['host'] : '';
    $uri .= isset($parsed['port']) ? ':'.$parsed['port'] : '';

    if (isset($parsed['path'])) {
        $uri .= (substr($parsed['path'], 0, 1) == '/') ?
            $parsed['path'] : ((!empty($uri) ? '/' : '' ) . $parsed['path']);
    }

    $uri .= isset($parsed['query']) ? '?'.$parsed['query'] : '';
    $uri .= isset($parsed['fragment']) ? '#'.$parsed['fragment'] : '';

    return $uri;
}
?>