Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
echo ""
echo "Then use taskkill /PID <pid> to then terminate the process, using /F if appropriate."
