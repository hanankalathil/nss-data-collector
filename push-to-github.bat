@echo off
setlocal
cd /d "%~dp0"

echo Pushing project to GitHub...
git add -A
rem Keep this script and app.js local and out of the repository push
 git reset HEAD -- push-to-github.bat 2>nul
 git reset HEAD -- js\app.js 2>nul

git commit -m "Update project"
if errorlevel 1 (
  echo No changes to commit or commit failed.
  goto end
)

git push origin main

echo.
echo Push complete.
:end
endlocal
