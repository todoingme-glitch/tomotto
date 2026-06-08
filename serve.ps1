$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8787/')
$listener.Start()
$baseDir = $PSScriptRoot
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $localPath = $req.Url.LocalPath
    if ($localPath -eq '/') { $localPath = '/index.html' }
    $filePath = Join-Path $baseDir $localPath.TrimStart('/')
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css' }
            '.js'   { 'application/javascript' }
            '.svg'  { 'image/svg+xml' }
            '.png'  { 'image/png' }
            '.ico'  { 'image/x-icon' }
            '.json' { 'application/json' }
            '.webmanifest' { 'application/manifest+json' }
            default { 'application/octet-stream' }
        }
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.Close()
}
