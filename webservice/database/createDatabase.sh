echo "DROP DATABASE IF EXISTS mobile;" | psql
echo "CREATE DATABASE mobile;" | psql 
psql mobile < schema.sql
psql mobile < users.sql
