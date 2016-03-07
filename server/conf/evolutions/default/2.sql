# --- !Ups
alter table meetings
add column lastTouched Double,
add index owner (owner, startTime);

# --- !Downs
alter table meetings
drop column lastTouched,
drop index owner;
