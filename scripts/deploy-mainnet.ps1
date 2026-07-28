param(
    [Parameter(Mandatory = $true)]
    [string]$SourceSecret,

    [string]$RpcUrl = "https://soroban-rpc.mainnet.stellar.gateway.fm",

    [string]$NetworkPassphrase = "Public Global Stellar Network ; September 2015",

    [int]$InclusionFee = 200
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
$wasmDir = Join-Path $repoRoot "target\wasm32v1-none\release"
$nodePath = Join-Path $repoRoot "backend\node_modules"
$env:NODE_PATH = $nodePath

function Get-PublicKeyFromSecret {
    param([string]$Secret)

    $pub = node -e "const { Keypair } = require('@stellar/stellar-sdk'); process.stdout.write(Keypair.fromSecret(process.argv[1]).publicKey());" $Secret
    if (-not $pub) {
        throw "Failed to derive public key from the provided secret key."
    }
    return $pub.Trim()
}

function Get-ContractSalt {
    param([string]$Name)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("demedia-mainnet::$Name")
        $hash = $sha256.ComputeHash($bytes)
        return ($hash | ForEach-Object { $_.ToString("x2") }) -join ""
    }
    finally {
        $sha256.Dispose()
    }
}

function Invoke-Stellar {
    param(
        [string[]]$CommandArgs,
        [switch]$CaptureStdout
    )

    $output = & stellar --quiet @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "stellar command failed: stellar $($CommandArgs -join ' ')"
    }

    if ($CaptureStdout) {
        return ($output | Out-String).Trim()
    }

    return $output
}

function Sign-Xdr {
    param([string]$Xdr)

    $signed = & stellar --quiet tx sign $Xdr --sign-with-key $SourceSecret --rpc-url $RpcUrl --network-passphrase $NetworkPassphrase
    if ($LASTEXITCODE -ne 0) {
        throw "stellar tx sign failed"
    }
    return ($signed | Out-String).Trim()
}

function Get-TxHash {
    param([string]$Xdr)

    $hash = & stellar --quiet tx hash $Xdr --rpc-url $RpcUrl --network-passphrase $NetworkPassphrase
    if ($LASTEXITCODE -ne 0) {
        throw "stellar tx hash failed"
    }
    return ($hash | Out-String).Trim()
}

function Send-Xdr {
    param([string]$Xdr)

    $sent = & stellar --quiet tx send $Xdr --rpc-url $RpcUrl --network-passphrase $NetworkPassphrase 2>&1
    if ($LASTEXITCODE -ne 0) {
        $sentText = ($sent | Out-String).Trim()
        throw "stellar tx send failed: $sentText"
    }
    return ($sent | Out-String).Trim()
}

$sourcePublicKey = Get-PublicKeyFromSecret -Secret $SourceSecret

$contracts = @(
    @{ Name = "content_registry"; File = "content_registry.wasm"; NeedsInit = $false }
)

$results = @()

foreach ($contract in $contracts) {
    $name = $contract.Name
    $wasmPath = Join-Path $wasmDir $contract.File
    if (-not (Test-Path $wasmPath)) {
        throw "Missing WASM artifact: $wasmPath. Build the workspace first."
    }

    $salt = Get-ContractSalt -Name $name
    $contractId = Invoke-Stellar -CommandArgs @(
        "contract", "id", "wasm",
        "--salt", $salt,
        "--source-account", $sourcePublicKey
    ) -CaptureStdout

    Write-Host ""
    Write-Host "==> $name"
    Write-Host "Contract ID: $contractId"
    Write-Host "Salt: $salt"

    $deployXdr = Invoke-Stellar -CommandArgs @(
        "contract", "deploy",
        "--build-only",
        "--wasm", $wasmPath,
        "--source-account", $SourceSecret,
        "--rpc-url", $RpcUrl,
        "--network-passphrase", $NetworkPassphrase,
        "--inclusion-fee", $InclusionFee.ToString(),
        "--optimize",
        "--salt", $salt
    ) -CaptureStdout

    $signedDeployXdr = Sign-Xdr -Xdr $deployXdr
    $deployTxHash = Get-TxHash -Xdr $signedDeployXdr
    $deployResult = Send-Xdr -Xdr $signedDeployXdr

    Write-Host "Deploy tx hash: $deployTxHash"
    Write-Host $deployResult

    $results += [pscustomobject]@{
        name = $name
        contractId = $contractId
        deployTxHash = $deployTxHash
        salt = $salt
        wasm = $contract.File
    }
}

$outDir = Join-Path $repoRoot "deployment"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir "mainnet-deployment.json"
$results | ConvertTo-Json -Depth 6 | Set-Content -Path $outFile -Encoding utf8

Write-Host ""
Write-Host "Deployment summary saved to $outFile"
Write-Host ($results | Format-Table -AutoSize | Out-String)
