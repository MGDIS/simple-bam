# Simple BAM

[![Build Status](https://travis-ci.org/MGDIS/simple-bam.svg?branch=master)](https://travis-ci.org/MGDIS/simple-bam)
[![Code Climate](https://codeclimate.com/github/MGDIS/simple-bam/badges/gpa.svg)](https://codeclimate.com/github/MGDIS/simple-bam)
[![Coverage Status](https://coveralls.io/repos/MGDIS/simple-bam/badge.png)](https://coveralls.io/r/MGDIS/simple-bam)

*Resources and tools using node.js and elasticsearch to help build a simple Business Activity Monitoring service.*

**Disclaimer: this is a work in progress. Come back later !**

## Running tests

    npm install
    npm test

The test suite uses mocks for all outgoing HTTP requests.
This is useful to run the tests without a ElasticSearch cluster available.
If you hava a cluster and want to run the tests in integration use:

    NOCK_OFF=true npm test

If you are working on the tests and want to re-record the mocks for the suite:

    NOCK_OFF=true, NOCK_RECORD=true npm test

Run with code coverage:

    npm run-script test-cover

## Running the simplest demonstration server

    npm start

## Updating the contract

First modify the XSD schema, which is for now the reference document. Then transform it into a JSON schema.

    npm install -g xsd2json2
    xsd2json2 -v -o ./resources/business-event-schema.json ./resources/businessEvent.xsd
