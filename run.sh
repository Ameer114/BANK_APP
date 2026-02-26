#!/bin/bash

# ============================================================
#  Bank Management System — Run Script
#  Builds backend & frontend, then starts both servers
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

BACKEND_LOG="$SCRIPT_DIR/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/frontend.log"

# PIDs file for cleanup
PID_FILE="$SCRIPT_DIR/.run.pids"

# ── Trap Ctrl+C to shut both servers down cleanly ─────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down servers...${NC}"
  if [ -f "$PID_FILE" ]; then
    while read -r pid; do
      kill "$pid" 2>/dev/null && echo -e "${GREEN}✓ Stopped PID $pid${NC}" || true
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi
  echo -e "${GREEN}Done. Goodbye!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Bank Management System — Starting Up    ${NC}"
echo -e "${GREEN}============================================${NC}"

# ── Sanity check: has setup been run? ────────────────────────
PROPS_FILE="$BACKEND_DIR/src/main/resources/application.properties"
if [ ! -f "$PROPS_FILE" ]; then
  echo -e "${RED}✗ application.properties not found.${NC}"
  echo -e "${YELLOW}  Please run ./setup.sh first.${NC}"
  exit 1
fi

# ── 1. Build backend ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}[1/3] Building backend (Maven)...${NC}"
cd "$BACKEND_DIR"
mvn clean package -DskipTests -q \
  && echo -e "${GREEN}✓ Backend build successful.${NC}" \
  || { echo -e "${RED}✗ Backend build failed. Check $BACKEND_LOG for details.${NC}"; exit 1; }

# Find the generated JAR
JAR_FILE=$(find "$BACKEND_DIR/target" -maxdepth 1 -name "*.jar" ! -name "*sources*" | head -1)
if [ -z "$JAR_FILE" ]; then
  echo -e "${RED}✗ No JAR file found in backend/target/. Build may have failed.${NC}"
  exit 1
fi
echo -e "${CYAN}  JAR: $JAR_FILE${NC}"

# ── 2. Start backend ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/3] Starting backend on http://localhost:8080 ...${NC}"
java -jar "$JAR_FILE" > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$PID_FILE"

# Wait for backend to be ready (up to 60s)
echo -n "  Waiting for backend"
TIMEOUT=60
ELAPSED=0
until curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || \
      curl -s http://localhost:8080/api/auth/login  > /dev/null 2>&1; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  echo -n "."
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo ""
    # Check if the process is still alive — Spring might be up even without actuator
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo -e "${RED}✗ Backend process died. Check $BACKEND_LOG${NC}"
      exit 1
    fi
    echo -e "${YELLOW}  (backend taking longer than usual, proceeding anyway)${NC}"
    break
  fi
done
echo ""
echo -e "${GREEN}✓ Backend is up.${NC}"

# ── 3. Start frontend ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/3] Starting frontend on http://localhost:3000 ...${NC}"
cd "$FRONTEND_DIR"
npm start > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PID_FILE"

# Wait for frontend to be ready (up to 60s)
echo -n "  Waiting for frontend"
ELAPSED=0
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  echo -n "."
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo ""
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
      echo -e "${RED}✗ Frontend process died. Check $FRONTEND_LOG${NC}"
      exit 1
    fi
    echo -e "${YELLOW}  (frontend taking longer than usual, proceeding anyway)${NC}"
    break
  fi
done
echo ""
echo -e "${GREEN}✓ Frontend is up.${NC}"

# ── All done ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🏦  Bank Management System is running!   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "  Frontend  →  ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend   →  ${CYAN}http://localhost:8080${NC}"
echo ""
echo -e "  Logs:"
echo -e "    Backend  → ${CYAN}$BACKEND_LOG${NC}"
echo -e "    Frontend → ${CYAN}$FRONTEND_LOG${NC}"
echo ""
echo -e "  First time? Create an admin account:"
echo -e "  ${CYAN}curl -X POST http://localhost:8080/api/auth/register \\${NC}"
echo -e "  ${CYAN}  -H 'Content-Type: application/json' \\${NC}"
echo -e "  ${CYAN}  -d '{\"username\":\"admin\",\"password\":\"admin123\",\"name\":\"Admin\",\"email\":\"admin@bank.com\",\"role\":\"ADMIN\"}'${NC}"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop both servers.${NC}"
echo ""

# Keep script alive so trap can fire on Ctrl+C
wait
