# Simple BAM

*Resources and tools using node.js and elasticsearch to help build a simple Business Activity Monitoring service.*

**Disclaimer: this is a work in progress. Come back later !**

## Updating the contract

In the sandbox with mgdis/contract.git and simple-bam cloned:

    cp ./contract/business-activity-monitoring/businessEvent.xsd ./simple-bam/resources/
    ./node-xsd2json/bin/xsd2json -v -o ./simple-bam/resources/business-event-schema.json ./simple-bam/resources/businessEvent.xsd
