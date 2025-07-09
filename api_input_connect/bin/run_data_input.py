#!/usr/bin/env python3
import os
import sys
import json
import requests
import xml.etree.ElementTree as ET
import logging

# Add local lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

# Configure logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


def get_session_key():
    try:
        input_str = sys.stdin.read()
        logger.debug(f"Input received: {input_str}")
        return input_str.strip()
    except Exception as e:
        logger.error(f"Failed to get session key: {e}")
        return None


# Constants
SPLUNKD_PORT = os.environ.get('SPLUNKD_PORT', '8089')
APP_NAME = 'api_input_connect'
COLLECTION = 'api_input_connect_config'
URL = f'https://localhost:{SPLUNKD_PORT}/servicesNS/nobody/{APP_NAME}/storage/collections/data/{COLLECTION}'
SESSION_KEY = get_session_key()
# Disable SSL warnings for self-signed certs
requests.packages.urllib3.disable_warnings()


def call_api(method, url, data=None, headers=None, **kwargs):
    """
    Helper to call an API with proper headers and error handling.
    method: 'get', 'post', etc.
    url: full URL to call
    data: dict or JSON string for POST/PUT
    headers: additional headers
    kwargs: passed to requests.request
    """
    if headers is None:
        headers = {}
    headers.setdefault('Content-Type', 'application/json')
    try:
        resp = requests.request(
            method,
            url,
            headers=headers,
            data=json.dumps(data) if data is not None and not isinstance(data, str) else data,
            verify=False,
            **kwargs
        )
        resp.raise_for_status()
        logger.info(f"response {resp} for {method} {url}")
        if resp.content:
            return resp.json()
        return None
    except Exception as e:
        logger.error(f"API {method.upper()} {url} failed: {e}")
        return None

def call_splunk_api(method, url, session_key=None, data=None, headers=None, **kwargs):
    """
    Helper to call Splunk API with session key for Authorization header.
    """
    if headers is None:
        headers = {}
    if session_key:
        headers['Authorization'] = f'Splunk {session_key}'
    return call_api(method, url, data=data, headers=headers, **kwargs)

def parse_headers(header_list):
    """
    Converts a list of header strings in the format '<name>: value'
    to a dictionary suitable for requests.
    """
    headers = {}
    for header in header_list:
        if ':' in header:
            name, value = header.split(':', 1)
            headers[name.strip()] = value.strip()
    return headers

def get_api_data(config):
    url = config.get('url')
    excluded_paths = config.get('excluded_json_paths', [])
    try:
        headers = parse_headers(config.get('headers', []))
        data = call_splunk_api('get', url, headers=headers)
        if data is None:
            raise Exception('No data returned from API')
        # Apply JSONPath exclusions if any
        if excluded_paths:
            try:
                from jsonpath_ng import parse
            except ImportError:
                logger.error(
                    "jsonpath-ng is required for exclusions. Please install it.")
                return data
            for path in excluded_paths:
                jsonpath_expr = parse(path)
                for match in jsonpath_expr.find(data):
                    context = match.context.value
                    if isinstance(context, dict):
                        context.pop(match.path.fields[0], None)
                    elif isinstance(context, list) and isinstance(match.path.index, int):
                        if 0 <= match.path.index < len(context):
                            context.pop(match.path.index)
        return data
    except Exception as e:
        logger.error(f"Failed to fetch or process API data: {e}")
        return None

def write_to_kvstore(app, collection, data):
    logger.info(f"Writing to KV Store collection: {collection}")
    url = f"https://localhost:{SPLUNKD_PORT}/servicesNS/nobody/{app}/storage/collections/data/{collection}"
    if isinstance(data, list):
        results = []
        for item in data:
            result = call_splunk_api('post', url, session_key=SESSION_KEY, data=item)
            results.append(result)
        return results
    else:
        return call_splunk_api('post', url, session_key=SESSION_KEY, data=data)

def empty_kvstore(app, collection):
    logger.info(f"Emptying KV Store collection: {collection}")
    url = f"https://localhost:{SPLUNKD_PORT}/servicesNS/nobody/{app}/storage/collections/data/{collection}/"
    call_splunk_api('delete', url, session_key=SESSION_KEY)
    logger.info(f"Successfully emptied KV Store collection: {collection}")
    return True


def get_kvstore_details_from_config(config):
    return config.get('selected_output_location', "/").split('/')


def main():
    if not SESSION_KEY:
        logger.error("No session key found, exiting.")
        return
    try:
        app_config = call_splunk_api('get', URL, session_key=SESSION_KEY)
        if app_config is None:
            logger.error("Failed to fetch app config.")
            return
        logger.info(f"App config: {json.dumps(app_config)}")
        for item in app_config:
            input_type = item.get('input_type')
            output_name = item.get('selected_output_location')
            if not output_name:
                logger.info(f"Skipping item with no output location: {item}")
                continue
            if input_type == 'kvstore':
                api_data = get_api_data(item)
                app, collection = get_kvstore_details_from_config(item)
                if item.get('mode') == 'overwrite':
                    empty_kvstore(app, collection)
                write_to_kvstore(app, collection, api_data)
            elif input_type == 'index':
                logger.info('debug: index')
    except Exception as e:
        logger.error(f"ERROR: {e}")

if __name__ == '__main__':
    main()
