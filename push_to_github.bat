@echo off
title Connect project-1 to GitHub
echo ========================================================
echo   Connecting 'project-1' to GitHub
echo ========================================================
echo.
echo Step 1: Authorizing with your GitHub account...
echo (A one-time code will appear and your browser will open)
echo.
"C:\Program Files\GitHub CLI\gh.exe" auth login --web -p https

echo.
echo Step 2: Creating GitHub repository 'project-1' and pushing code...
"C:\Program Files\GitHub CLI\gh.exe" repo create project-1 --public --source=. --remote=origin --push

echo.
echo ========================================================
echo   Successfully published to GitHub!
echo ========================================================
pause
