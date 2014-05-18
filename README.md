Bookstand
---------

UCSD Textbook Exchange Site for COGS 121

Installing and Running
----------------------

First, you should install `npm` using your favorite package manager

Additionally, you should be running a local postgres server and have the `psql` command
in your `PATH`. If you are running Mac OS X, you can get postgres from:
http://postgresapp.com/. Otherwise, you can install it using your favorite package manager.

To install the dependencies and set up the DB, run

    make

Ensure that you have sane values for the following environment variables:

    FB_APP_ID
    FB_SECRET
    SERVER_URL
    SESSION_SECRET

*RUN THE TESTS*

    make test

To run the server, run

    node app.js
