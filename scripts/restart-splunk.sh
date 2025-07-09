#!/bin/bash

CONTAINER_NAME="splunk" 

docker exec -u splunk "$CONTAINER_NAME" /opt/splunk/bin/splunk restart
