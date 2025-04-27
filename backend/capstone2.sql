\echo 'Delete and recreate Capstone2 db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS capstone2;
CREATE DATABASE capstone2;
\connect capstone2

-- Connects to the other .sql files for the schema and the seed
\i capstone2-schema.sql
\i capstone2-seed.sql