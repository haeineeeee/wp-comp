#!/bin/sh
# 프로덕션 DB에 초대 코드 시드 데이터 삽입
# 사용법: ./scripts/seed-production.sh

echo "Seeding production database..."

docker exec wp-comp-db-1 psql -U wpcomp -d wpcomp -c "
INSERT INTO \"User\" (id, email, name, \"createdAt\", \"updatedAt\")
VALUES ('system', 'system@wp-companion.local', 'System', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO \"InviteCode\" (id, code, \"createdById\", \"expiresAt\", \"createdAt\")
VALUES ('seed1', 'WELCOME1', 'system', '2026-12-31', NOW())
ON CONFLICT (code) DO NOTHING;
"

echo "Done. Verifying..."
docker exec wp-comp-db-1 psql -U wpcomp -d wpcomp -c 'SELECT code, "expiresAt" FROM "InviteCode";'
