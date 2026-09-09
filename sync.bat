@echo off
setlocal enabledelayedexpansion

set "MSG=%~1"
if "%MSG%"=="" (
    set /p "MSG=Enter commit message (or press Enter for automatic timestamp): "
)
if "!MSG!"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set "MSG=Update: !datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!"
)

echo [1/3] Staging changes...
git add .

git diff-index --quiet HEAD --
if %ERRORLEVEL% EQU 0 (
    echo No new changes to commit.
    exit /b 0
)

echo [2/3] Committing: "!MSG!"...
git commit -m "!MSG!"

echo [3/3] Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Successfully pushed to GitHub!
) else (
    echo.
    echo Push failed. Please check your connection or credentials.
)
