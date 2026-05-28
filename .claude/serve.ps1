$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:8787/")
$listener.Start()
Write-Host "Server running on http://localhost:8787/"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath.TrimStart('/')
    if (-not $path) { $path = 'index.html' }
    $file = Join-Path "C:\Users\user\Documents\GitHub\tomotto" ($path -replace '/', '\')
    if (Test-Path $file) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $mime = switch($ext) {
        '.js'   {'application/javascript; charset=utf-8'}
        '.css'  {'text/css; charset=utf-8'}
        '.html' {'text/html; charset=utf-8'}
        '.json' {'application/json; charset=utf-8'}
        '.svg'  {'image/svg+xml'}
        '.png'  {'image/png'}
        '.jpg'  {'image/jpeg'}
        default {'application/octet-stream'}
      }
      $content = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $mime
      $ctx.Response.AddHeader("Cache-Control", "no-cache")
      $ctx.Response.ContentLength64 = $content.LongLength
      $ctx.Response.OutputStream.Write($content, 0, $content.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $err = [System.Text.Encoding]::UTF8.GetBytes("Not found: $path")
      $ctx.Response.ContentLength64 = $err.LongLength
      $ctx.Response.OutputStream.Write($err, 0, $err.Length)
    }
    $ctx.Response.OutputStream.Flush()
    $ctx.Response.Close()
  } catch {
    Write-Host "Error: $_"
    try { $ctx.Response.Close() } catch {}
  }
}
