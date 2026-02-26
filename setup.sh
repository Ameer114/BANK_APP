#!/bin/bash

# ============================================================
#  Bank Management System — Setup Script
#  Run once to configure DB credentials and install dependencies
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Bank Management System — Setup       ${NC}"
echo -e "${GREEN}========================================${NC}"

# ── 1. Check prerequisites ────────────────────────────────────

check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}✗ '$1' is not installed or not in PATH. Please install it and re-run setup.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $1 found: $(command -v $1)${NC}"
  fi
}

echo ""
echo -e "${YELLOW}[1/5] Checking prerequisites...${NC}"
check_command java
check_command mvn
check_command node
check_command npm
check_command mysql

# Java version check (need 17+)
JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
  echo -e "${RED}✗ Java 17+ is required (found Java $JAVA_VER). Please upgrade.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Java version OK ($JAVA_VER)${NC}"

# ── 2. Collect DB credentials ─────────────────────────────────

echo ""
echo -e "${YELLOW}[2/5] MySQL Configuration${NC}"
read -p "  MySQL host     [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "  MySQL port     [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "  MySQL username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "  MySQL password : " DB_PASS
echo ""

read -p "  Database name  [banking_db]: " DB_NAME
DB_NAME=${DB_NAME:-banking_db}

# ── 3. Create database ────────────────────────────────────────

echo ""
echo -e "${YELLOW}[3/5] Creating MySQL database '$DB_NAME'...${NC}"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
  -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
  && echo -e "${GREEN}✓ Database ready.${NC}" \
  || { echo -e "${RED}✗ Failed to connect to MySQL. Check credentials.${NC}"; exit 1; }

# ── 4. Write application.properties ──────────────────────────

PROPS_FILE="$(dirname "$0")/backend/src/main/resources/application.properties"

echo ""
echo -e "${YELLOW}[4/5] Writing backend configuration...${NC}"

# Generate a random JWT secret (64 hex chars = 256 bits)
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /proc/sys/kernel/random/uuid | tr -d '-' | head -c 64)

cat > "$PROPS_FILE" <<EOF
spring.application.name=banking-system

# ── DataSource ──────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ── JPA / Hibernate ─────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# ── JWT ─────────────────────────────────────────────────────
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# ── Server ──────────────────────────────────────────────────
server.port=8080
EOF

echo -e "${GREEN}✓ application.properties written.${NC}"

# ── 5. Install frontend dependencies ─────────────────────────

echo ""
echo -e "${YELLOW}[5/5] Installing frontend dependencies (npm install)...${NC}"
cd "$(dirname "$0")/frontend"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed.${NC}"

# ── Done ──────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup complete! Run ./run.sh to start.${NC}"
echo -e "${GREEN}========================================${NC}"
