DROP TABLE IF EXISTS Tiles;
CREATE TABLE Tiles (
    tileID int NOT NULL PRIMARY KEY,
    latitude float(24),
    longitude float(24)
);