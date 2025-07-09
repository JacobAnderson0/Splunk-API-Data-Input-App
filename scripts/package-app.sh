#!/bin/bash

# Run the install script to prepare or build necessary components
scripts/install.sh && \

# Create a tar.gz archive of the app folder, excluding unnecessary or sensitive files
tar \
  --exclude='*.pyc' \
  --exclude='api_input_connect/metadata/local.meta' \
  --exclude='api_input_connect/local' \
  --exclude='api_input_connect/.*' \
  -cvzf api_input_connect.tar.gz api_input_connect

# Check if the first argument is --app-inspect
if [[ "$1" == "--app-inspect" ]]; then
  # Run Splunk AppInspect with the --app-inspect flag only
  splunk-appinspect inspect api_input_connect.tar.gz --app-inspect
fi