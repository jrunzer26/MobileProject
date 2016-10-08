CREATE TABLE Users (
    username varchar(255) NOT NULL PRIMARY KEY,
    password varchar(255) NOT NULL,
    gold int DEFAULT 0,
    food int DEFAULT 0,
    tiles int DEFAULT 0
);

CREATE TABLE Tiles (
    tileID int NOT NULL PRIMARY KEY,
    latitude float(24),
    longitude float(24)
);
