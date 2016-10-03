CREATE TABLE Users (
    username varchar(255) NOT NULL PRIMARY KEY,
    gold int,
    food int,
    wood int,
    tiles int
);

CREATE TABLE Tiles (
    tileID int NOT NULL PRIMARY KEY,
    latitude float(24),
    longitude float(24)
);
