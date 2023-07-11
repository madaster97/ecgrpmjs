# Plan
- PostGres database
    - dbml converted to postgres, just use query tool in the DB you create
    - https://stackoverflow.com/questions/51566090/how-to-import-a-schema-sql-file-using-pgadmin-4
- Prisma ORM: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
- Typescript/express server (later)
- HL7v2 JavaScript library: https://www.npmjs.com/package/hl7

# Docker Scripts
- Making a bridge network (ecgrpm)
- Use web/db as names
- Make a volume named ecgrpm: `docker volume create ecgrpm`

## DB Script
`docker run --name ecgrpm-pg --network ecgrpm -v ecgrpm:/data/db -e POSTGRES_PASSWORD=admin -p 5432:5432 postgres:latest`

## PG admin script
`docker run --name ecgrpm-pgadmin --network ecgrpm -e "PGADMIN_DEFAULT_EMAIL=name@example.com" -e "PGADMIN_DEFAULT_PASSWORD=admin" -p 5050:80 -d dpage/pgadmin4:latest`

http://locahost:5050https://dbdiagram.io/docs/
https://dbdiagram.io/d/649ce02b02bd1c4a5e39a523
https://blog.appsignal.com/2020/01/15/the-pros-and-cons-of-using-structure-sql-in-your-ruby-on-rails-application.html

Working on a really simple db

# Actions Needed
Events from Epic:
- Enrollment received (when received, set OPEN Enrollment)
    - Respond immediately, don't create period
    - If anything fails send a V2 error!
- Period callback (when received, set OPEN Period)
    - What if we don't know this period?
    - Send a V2 error!

How do we make sure an enrollment has only 1 active finding?
https://www.prisma.io/docs/concepts/components/prisma-schema/relations#disambiguating-relations

Events from app: (HTTP/v2 Errors show in UI)
- Enrollment closed (after HTTP success, set CLOSED Enrollment)
- Period created (write SUBMITTED Period row, if HTTP fails show error)
- Period closed (after HTTP success, set CLOSED Period)
- Finding sumbmitted (write row, if HTTP fails show error)

# Old
First pass actions needed:
- Enroll a patient with an order message
    - Write OPEN default when received
    - Write CLOSED when we close it
- Create a new period for an enrollment
    - Write SUBMITTED after submitting w/o error
    - Write OPEN when accession ID received (should only be one open period per enrollment at a time)
    - Write CLOSED when we close it out
- Submit a finding for a period
- Close a period
- Close an enrollment

Later actions needed:
- cancel order(s)
- Failed findings/period creations

Items on an enrollment:
- patient (reference)
- enrollment order ID (numeric)
- authorizing provider (varchar)
- enrollment instant (timestamp)
- status (open, closed, cancelled)
- (later) ordering user
- (later) order-specific questions
- (later) handled failed findings

Items on a patient:
- MRN (varchar, indexed)
- other demographics (rest of PID string)
- (later) split demographics

Items on a period:
- accession ID (optional)
- enrollment
- status (submitted, open, closed, cancelled)
- submit instant (timestamp)
- (later) external order ID

Items on a finding:
- period
- found instant
- (later) external ID
- (later) acuity + finding
- (later) staus (filed, errored)


https://www.prisma.io/docs/concepts/components/prisma-schema/relations
