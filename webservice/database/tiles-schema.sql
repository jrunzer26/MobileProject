DROP TABLE IF EXISTS Tiles;
CREATE TABLE Tiles (
    "tileID" SERIAL PRIMARY KEY,
    "tileLatID" int NOT NULL,
    "tileLngID" int NOT NULL,
    "username" varchar(255),
    "gold" int NOT NULL,
    "food" int NOT NULL,
    FOREIGN KEY(username) REFERENCES Users(username)
);