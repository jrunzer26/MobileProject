DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    "username" varchar(255) NOT NULL PRIMARY KEY,
    "password" varchar(255) NOT NULL,
    "gold" int DEFAULT 0,
    "food" int DEFAULT 0,
    "tiles" int DEFAULT 0,
    "tilesTaken" int DEFAULT 0,
    "goldObtained" int DEFAULT 0,
    "foodObtained" int DEFAULT 0,
    "totalGoldObtained" int DEFAULT 0,
    "totalFoodObtained" int DEFAULT 0,
    "totalSoldiers" int DEFAULT 0,
    "soldiersAvailable" int DEFAULT 0
);
