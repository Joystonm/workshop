# Probe Firecrawl /v2 endpoints. Run from F:\workshop:
#   powershell -ExecutionPolicy Bypass -File .\test-firecrawl.ps1

$ErrorActionPreference = 'Continue'

$envFile = Join-Path $PSScriptRoot '.env.local'
$apiKey  = (Get-Content $envFile | Where-Object { $_ -match '^FIRECRAWL_API_KEY=(.+)$' }) -replace '^FIRECRAWL_API_KEY=', ''

$base = 'https://api.firecrawl.dev/v2'
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $apiKey"
}

function Probe([string]$name, [string]$url, [string]$body, [int]$timeoutSec = 30) {
    Write-Host "=== $name ==="
    $bodyPath = Join-Path $env:TEMP ("fc-" + [guid]::NewGuid() + ".json")
    [System.IO.File]::WriteAllText($bodyPath, $body, [System.Text.UTF8Encoding]::new($false))
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers `
            -Body ([System.IO.File]::ReadAllText($bodyPath)) `
            -TimeoutSec $timeoutSec
        $sw.Stop()
        Write-Host "HTTP 200 in $([int]$sw.Elapsed.TotalSeconds)s"
        $resp | ConvertTo-Json -Depth 4
    } catch {
        $sw.Stop()
        Write-Host "Failed in $([int]$sw.Elapsed.TotalSeconds)s: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            Write-Host "Body: $($reader.ReadToEnd())"
        }
    } finally {
        Remove-Item $bodyPath -ErrorAction SilentlyContinue
    }
    Write-Host ""
}

Probe "v2/search: pendulum" "$base/search" '{"query":"pendulum period","limit":2}' 20
Probe "v2/scrape: wikipedia/pendulum" "$base/scrape" '{"url":"https://en.wikipedia.org/wiki/Pendulum","formats":["markdown"]}' 25
