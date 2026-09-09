param (
    [Parameter(Mandatory=$false, Position=0)]
    [string]$Message = ""
)

# If no message was passed, ask interactively or provide default
if ([string]::IsNullOrWhiteSpace($Message)) {
    $InputMsg = Read-Host "Enter commit message (or press Enter for automatic timestamp)"
    if ([string]::IsNullOrWhiteSpace($InputMsg)) {
        $Message = "Update: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    } else {
        $Message = $InputMsg
    }
}

Write-Host "`n🚀 Staging all changes (respecting .gitignore)..." -ForegroundColor Cyan
git add .

# Check if there are any staged changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️ No changes detected to commit. Working tree is already clean." -ForegroundColor Yellow
    exit 0
}

Write-Host "📦 Creating commit with message: '$Message'..." -ForegroundColor Cyan
git commit -m "$Message"

Write-Host "🌐 Pushing to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed changes to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Push failed. Check your network or credentials." -ForegroundColor Red
}
