# Test MiniMax-M3 with key from .env.local. Run from F:\workshop:
#   powershell -ExecutionPolicy Bypass -File .\test-minimax.ps1

$ErrorActionPreference = 'Stop'

# Pull MINIMAX_API_KEY from .env.local (no key in this file).
$envFile = Join-Path $PSScriptRoot '.env.local'
if (-not (Test-Path $envFile)) {
    Write-Error "Missing .env.local at $envFile"
}
$apiKey = (Get-Content $envFile | Where-Object { $_ -match '^MINIMAX_API_KEY=(.+)$' }) -replace '^MINIMAX_API_KEY=', ''
if (-not $apiKey) { Write-Error "MINIMAX_API_KEY not set in .env.local" }

$body = '{"model":"MiniMaxAI/MiniMax-M3","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":64}'
$bodyPath = Join-Path $env:TEMP 'minimax-ping.json'
[System.IO.File]::WriteAllText($bodyPath, $body, [System.Text.UTF8Encoding]::new($false))

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $apiKey"
}

try {
    $resp = Invoke-RestMethod -Uri "https://api.gmi-serving.com/v1/chat/completions" `
        -Method Post -Headers $headers `
        -Body ([System.IO.File]::ReadAllText($bodyPath)) `
        -TimeoutSec 30
    $resp | ConvertTo-Json -Depth 6
    Write-Host ""
    Write-Host "--- assistant content ---"
    $resp.choices[0].message.content
} catch {
    Write-Host "Request failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
