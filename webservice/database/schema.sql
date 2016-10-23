CREATE TABLE Users (
    username varchar(255) NOT NULL PRIMARY KEY,
    password varchar(255) NOT NULL,
    gold int DEFAULT 0,
    food int DEFAULT 0,
    tiles int DEFAULT 0,
    tilesTaken int DEFAULT 0,
    goldObtained int DEFAULT 0,
    foodObtained int DEFAULT 0
);

CREATE TABLE Tiles (
    tileID int NOT NULL PRIMARY KEY,
    latitude float(24),
    longitude float(24),
    username varchar(255),
    FOREIGN KEY(username) REFERENCES Users(username)
);

