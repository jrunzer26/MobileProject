@echo off
echo DROP DATABASE IF EXISTS mobile; | psql -U postgres
echo CREATE DATABASE mobile; | psql -U postgres
psql -U postgres mobile < schema.sql
psql -U postgres mobile < users.sql