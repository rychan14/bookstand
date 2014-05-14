Bookstand
---------

UCSD Textbook Exchange Site for COGS 121

Installing and Running
----------------------

First, you should install `npm` using your favorite package manager

Additionally, you should be running a local postgres server and have the `psql` command
in your `PATH`

To install the dependencies and set up the DB, run

    make

Ensure that you have sane values for the following environment variables:

    FB_APP_ID 
    FB_SECRET 
    SERVER_URL
    SESSION_SECRET

To run the server, run

    node app.js
