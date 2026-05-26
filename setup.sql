CREATE DATABASE workout_tracker;
CREATE USER workout_user WITH PASSWORD 'gonc2004';
GRANT ALL PRIVILEGES ON DATABASE workout_tracker TO workout_user;
GRANT ALL ON SCHEMA public TO workout_user;