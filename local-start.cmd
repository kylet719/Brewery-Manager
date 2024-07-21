@echo off

:: Change to the directory where the script is located
cd %~dp0

:: Configure the oracle instant client env variable
set PATH=%PATH%;"C:\Users\Kyle\Oracle"

:: Start Node application
node server.js

exit /b 0
