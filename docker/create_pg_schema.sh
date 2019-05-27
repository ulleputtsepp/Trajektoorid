#!/usr/bin/env bash
psql <<EOF
CREATE SCHEMA IF NOT EXISTS $DB_SCHEMA;
EOF
