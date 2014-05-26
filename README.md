Bookstand
---------

UCSD Textbook Exchange Site for COGS 121

Installing and Running
----------------------

First, you should install `npm` using your favorite package manager

Additionally, you should be running a local mongo server and have the `mongo` command
in your `PATH`.

To install the dependencies and set up the DB, run

    make

Ensure that you have sane values for the following environment variables:

    FB_APP_ID            // Bookstand App Id
    FB_SECRET            // Bookstand App Secret
    SERVER_URL           // Fully-qualified server URL
    SESSION_SECRET       // A secret for storing cookies
    TEST_TOKEN           // A FB Access Token with basic permissions
    PUBLISH_TEST_TOKEN   // A FB Access token with publish permissions
    TEXTBOOK_GRP_ID      // The group id for the UCSD Textbook exchange group 331733573546962
    TEST_TEXTBOOK_GRP_ID // The group id for the test exchange group 673385732715076
    BS_DB_URI            // The URI for the bookstand mongo server
    TEST_DB_URI          // The URI for the test server

The values for `TEST_TOKEN` and `PUBLISH_TEST_TOKEN` can be obtained by running the server
and logging in. The values for `TEXTBOOK_GRP_ID` and `TEST_TEXTBOOK_GRP_ID` can be set to
`331733573546962` and `673385732715076` respectively. The values for `BS_DB_URI` and
`TEST_DB_URI` should be set to `mongodb://127.0.0.1:27017/bookstand` and
`mongodb://127.0.0.1:27017/test` for normal use.

*RUN THE TESTS*

    make test

To run the server, run

    node app.js

To run the FB post listener, run

    node listener.js
