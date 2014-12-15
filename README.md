# Simple BAM

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

## Updating the contract

In the sandbox with mgdis/contract.git and simple-bam cloned:

    cp ./contract/business-activity-monitoring/businessEvent.xsd ./simple-bam/resources/
    ./node-xsd2json/bin/xsd2json -v -o ./simple-bam/resources/business-event-schema.json ./simple-bam/resources/businessEvent.xsd
