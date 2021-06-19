@echo off
netstat -a -n -o | find "5000"
echo Then kill the process by PID use: taskkill /F /PID NNNN