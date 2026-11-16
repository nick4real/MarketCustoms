#!/bin/bash
# Starts the official mongo image as a single-node replica set so multi-document transactions work.
# Runs as root, prepares the keyFile that replica sets with auth require, then hands over to the stock entrypoint.
set -eu

KEYFILE=/etc/mongo-keyfile
openssl rand -base64 756 > "$KEYFILE"
chown mongodb:mongodb "$KEYFILE"
chmod 400 "$KEYFILE"

init_replica_set() {
  # Retries until the real (auth-enabled, --replSet) server answers; the stock entrypoint first runs a
  # temporary server for user creation, against which initiate fails and is simply retried.
  # rs.status() throws until the set is initiated, so existing volumes are left untouched.
  for _ in $(seq 1 120); do
    if mongosh --quiet --port 27017 -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
        --authenticationDatabase admin --eval 'try { rs.status() } catch (e) { rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] }) }' > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "mongo-replset-entrypoint: gave up initiating replica set rs0 after 120 attempts" >&2
}

init_replica_set &

exec docker-entrypoint.sh mongod --replSet rs0 --keyFile "$KEYFILE" --bind_ip_all
