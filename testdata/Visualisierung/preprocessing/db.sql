DROP TABLE IF EXISTS hinundweg_tupel;
CREATE TABLE hinundweg_tupel AS
	SELECT '00' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `0` AS anzahl FROM hinundweg_matrix UNION
	SELECT '01' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `1` FROM hinundweg_matrix UNION
	SELECT '02' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `2` FROM hinundweg_matrix UNION
	SELECT '03' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `3` FROM hinundweg_matrix UNION
	SELECT '04' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `4` FROM hinundweg_matrix UNION
	SELECT '05' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `5` FROM hinundweg_matrix UNION
	SELECT '06' AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `6` FROM hinundweg_matrix UNION
	SELECT 10 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `10` FROM hinundweg_matrix UNION
	SELECT 11 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `11` FROM hinundweg_matrix UNION
	SELECT 12 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `12` FROM hinundweg_matrix UNION
	SELECT 13 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `13` FROM hinundweg_matrix UNION
	SELECT 14 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `14` FROM hinundweg_matrix UNION
	SELECT 15 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `15` FROM hinundweg_matrix UNION
	SELECT 20 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `20` FROM hinundweg_matrix UNION
	SELECT 21 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `21` FROM hinundweg_matrix UNION
	SELECT 22 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `22` FROM hinundweg_matrix UNION
	SELECT 23 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `23` FROM hinundweg_matrix UNION
	SELECT 24 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `24` FROM hinundweg_matrix UNION
	SELECT 25 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `25` FROM hinundweg_matrix UNION
	SELECT 26 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `26` FROM hinundweg_matrix UNION
	SELECT 27 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `27` FROM hinundweg_matrix UNION
	SELECT 28 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `28` FROM hinundweg_matrix UNION
	SELECT 29 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `29` FROM hinundweg_matrix UNION
	SELECT 30 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `30` FROM hinundweg_matrix UNION
	SELECT 31 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `31` FROM hinundweg_matrix UNION
	SELECT 32 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `32` FROM hinundweg_matrix UNION
	SELECT 33 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `33` FROM hinundweg_matrix UNION
	SELECT 34 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `34` FROM hinundweg_matrix UNION
	SELECT 35 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `35` FROM hinundweg_matrix UNION
	SELECT 40 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `40` FROM hinundweg_matrix UNION
	SELECT 41 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `41` FROM hinundweg_matrix UNION
	SELECT 42 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `42` FROM hinundweg_matrix UNION
	SELECT 43 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `43` FROM hinundweg_matrix UNION
	SELECT 44 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `44` FROM hinundweg_matrix UNION
	SELECT 50 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `50` FROM hinundweg_matrix UNION
	SELECT 51 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `51` FROM hinundweg_matrix UNION
	SELECT 52 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `52` FROM hinundweg_matrix UNION
	SELECT 53 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `53` FROM hinundweg_matrix UNION
	SELECT 54 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `54` FROM hinundweg_matrix UNION
	SELECT 55 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `55` FROM hinundweg_matrix UNION
	SELECT 60 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `60` FROM hinundweg_matrix UNION
	SELECT 61 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `61` FROM hinundweg_matrix UNION
	SELECT 62 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `62` FROM hinundweg_matrix UNION
	SELECT 63 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `63` FROM hinundweg_matrix UNION
	SELECT 64 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `64` FROM hinundweg_matrix UNION
	SELECT 65 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `65` FROM hinundweg_matrix UNION
	SELECT 66 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `66` FROM hinundweg_matrix UNION
	SELECT 70 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `70` FROM hinundweg_matrix UNION
	SELECT 71 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `71` FROM hinundweg_matrix UNION
	SELECT 72 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `72` FROM hinundweg_matrix UNION
	SELECT 73 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `73` FROM hinundweg_matrix UNION
	SELECT 74 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `74` FROM hinundweg_matrix UNION
	SELECT 75 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `75` FROM hinundweg_matrix UNION
	SELECT 80 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `80` FROM hinundweg_matrix UNION
	SELECT 81 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `81` FROM hinundweg_matrix UNION
	SELECT 82 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `82` FROM hinundweg_matrix UNION
	SELECT 83 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `83` FROM hinundweg_matrix UNION
	SELECT 90 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `90` FROM hinundweg_matrix UNION
	SELECT 91 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `91` FROM hinundweg_matrix UNION
	SELECT 92 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `92` FROM hinundweg_matrix UNION
	SELECT 93 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `93` FROM hinundweg_matrix UNION
	SELECT 94 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `94` FROM hinundweg_matrix UNION
	SELECT 95 AS `von`, LPAD(`nach`, 2, '0') AS `nach`, `95` FROM hinundweg_matrix;

UPDATE hinundweg_tupel SET anzahl = 1 WHERE anzahl LIKE '.';

DROP TABLE IF EXISTS hinundweg_wegzug;
CREATE TABLE hinundweg_wegzug AS
	SELECT von AS id, SUM(anzahl) AS anzahl
	FROM hinundweg_tupel
	WHERE nach <> von
	GROUP BY von;

DROP TABLE IF EXISTS hinundweg_zuzug;
CREATE TABLE hinundweg_zuzug AS
	SELECT nach AS id, SUM(anzahl) AS anzahl
	FROM hinundweg_tupel
	WHERE nach <> von
	GROUP BY nach;

DROP TABLE IF EXISTS hinundweg_umzug;
CREATE TABLE hinundweg_umzug AS
	SELECT weg.id, hin.anzahl AS hin, weg.anzahl AS weg
	FROM hinundweg_wegzug AS weg, hinundweg_zuzug AS hin
	WHERE weg.id = hin.id;

-- { from: "A", to: "D", value: 10 },
SELECT CONCAT('{ from: "', von, '", to: "', nach, '", value: ', anzahl, '},') FROM hinundweg_tupel;

-- { "id": "65", "from" : 123, "to" : 432 },
SELECT CONCAT('{ "id": "', id, '", "hin": ', hin, ', "weg": ', weg, '},') FROM hinundweg_umzug;

