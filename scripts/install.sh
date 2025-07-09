#!/bin/bash


# Navigate to the client directory
cd client

# Install npm dependencies
npm install

# Return to the project root directory
cd ..

# Reload the Splunk app to apply changes
./scripts/reload-app.sh