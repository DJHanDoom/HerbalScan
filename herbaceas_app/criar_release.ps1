# Script para criar Release no GitHub via API
# Requer: Token de acesso pessoal do GitHub (GITHUB_TOKEN)

param(
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Tag = "v3.0.0-WIN",
    [string]$InstallerPath = "installer_output\HerbalScan_Setup_v2.0.0.exe"
)

$RepoOwner = "DJHanDoom"
$RepoName = "HerbalScan"
$ApiUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/releases"

# Verificar se o token foi fornecido
if (-not $Token) {
    Write-Host "❌ Erro: Token do GitHub não fornecido!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "1. Definir variável de ambiente: `$env:GITHUB_TOKEN = 'seu_token_aqui'"
    Write-Host "2. Passar como parâmetro: .\criar_release.ps1 -Token 'seu_token_aqui'"
    Write-Host ""
    Write-Host "Para criar um token:" -ForegroundColor Cyan
    Write-Host "https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "Permissões necessárias: repo (Full control of private repositories)"
    exit 1
}

# Verificar se o instalador existe
if (-not (Test-Path $InstallerPath)) {
    Write-Host "❌ Erro: Instalador não encontrado em: $InstallerPath" -ForegroundColor Red
    exit 1
}

# Ler as notas da release
$ReleaseNotes = Get-Content "RELEASE_NOTES.md" -Raw -Encoding UTF8

# Criar o corpo da release
$ReleaseBody = @{
    tag_name = $Tag
    name = "v3.0.0 WIN - Aplicativo Standalone Windows"
    body = $ReleaseNotes
    draft = $false
    prerelease = $false
} | ConvertTo-Json

Write-Host "🚀 Criando release no GitHub..." -ForegroundColor Green
Write-Host "Tag: $Tag" -ForegroundColor Cyan
Write-Host "Repositório: $RepoOwner/$RepoName" -ForegroundColor Cyan
Write-Host ""

try {
    # Criar a release
    $Headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Headers $Headers -Body $ReleaseBody -ContentType "application/json"
    
    Write-Host "✅ Release criada com sucesso!" -ForegroundColor Green
    Write-Host "URL: $($Response.html_url)" -ForegroundColor Cyan
    Write-Host ""
    
    # Fazer upload do instalador
    Write-Host "📦 Fazendo upload do instalador..." -ForegroundColor Green
    
    $UploadUrl = $Response.upload_url -replace '\{.*$', ''
    $FileName = Split-Path $InstallerPath -Leaf
    $FileBytes = [System.IO.File]::ReadAllBytes($InstallerPath)
    $FileEnc = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($FileBytes)
    $Boundary = [System.Guid]::NewGuid().ToString()
    
    $UploadHeaders = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $BodyLines = (
        "--$Boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$FileName`"",
        "Content-Type: application/octet-stream",
        "",
        $FileEnc,
        "--$Boundary--"
    ) -join "`r`n"
    
    $UploadResponse = Invoke-RestMethod -Uri "$UploadUrl?name=$FileName" -Method Post -Headers $UploadHeaders -Body ([System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($BodyLines)) -ContentType "multipart/form-data; boundary=$Boundary"
    
    Write-Host "✅ Instalador enviado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Release completa!" -ForegroundColor Green
    Write-Host "Acesse: $($Response.html_url)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao criar release:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $ResponseBody = $Reader.ReadToEnd()
        Write-Host "Detalhes: $ResponseBody" -ForegroundColor Yellow
    }
    
    exit 1
}

