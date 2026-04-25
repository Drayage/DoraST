#!/bin/bash
cd "$(dirname "$0")"
echo "게임 서버 시작: http://localhost:8080"
echo "종료: Ctrl+C"
python3 -m http.server 8080
