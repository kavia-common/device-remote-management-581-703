#!/bin/bash
cd /home/kavia/workspace/code-generation/device-remote-management-581-703/FrontendApplicationContainer
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

