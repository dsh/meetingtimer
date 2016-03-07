
# --- !Ups
CREATE TABLE meetings (
  id CHAR(8) NOT NULL PRIMARY KEY,
  name VARCHAR(1024) NOT NULL,
  startTime DOUBLE NOT NULL,
  participants INT NOT NULL,
  hourlyRate DECIMAL(10, 2) NOT NULL,
  stopTime DOUBLE,
  owner CHAR(36) NOT NULL
);

# --- !Downs
DROP TABLE meetings;
