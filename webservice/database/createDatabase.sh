echo "DROP DATABASE IF EXISTS mobile;" | psql
echo "CREATE DATABASE mobile;" | psql 
echo "psql mobile < schema.sql"
psql mobile < users-schema.sql
psql mobile < tiles-schema.sql
