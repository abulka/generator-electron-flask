@echo off
netstat -a -n -o | find "<%= portFlask %>"
echo Then kill the process by PID use: taskkill /F /PID NNNN