CREATE TABLE Users (
    "username" varchar(255) NOT NULL PRIMARY KEY,
    "password" varchar(255) NOT NULL,
    "gold" int DEFAULT 0,
    "food" int DEFAULT 0,
    "tiles" int DEFAULT 0,
    "tilesTaken" int DEFAULT 0,
    "goldObtained" int DEFAULT 0,
    "foodObtained" int DEFAULT 0
);

CREATE TABLE Tiles (
    "tileID" SERIAL PRIMARY KEY,
    "tileLatID" int NOT NULL,
    "tileLngID" int NOT NULL,
    "username" varchar(255),
    "gold" int NOT NULL,
    "food" int NOT NULL,
    FOREIGN KEY(username) REFERENCES Users(username)
);

