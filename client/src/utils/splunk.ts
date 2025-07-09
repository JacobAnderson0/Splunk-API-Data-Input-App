// @ts-expect-error splunk-utils is not typed
import { createRESTURL } from "@splunk/splunk-utils/url";
// @ts-expect-error splunk-utils is not typed
import * as config from "@splunk/splunk-utils/config";
import {
  handleError,
  handleResponse,
  defaultFetchInit,
  // @ts-expect-error splunk-utils is not typed
} from "@splunk/splunk-utils/fetch";
import type { DataInputAppConfig } from "../components/ManageDataInputs/DataInputs.types";

// copying https://github.com/splunk/SUIT-example-for-kv-store/blob/main/packages/kv-store-app/src/main/webapp/pages/kv-crud/KVTable.jsx

// export async function getKVStoreCollectionCount(collectionName: string, appName?: string) {
//     // run a splunk search to get the count of records in a collection
//     const url = createRESTURL('services/search/job', {app: appName || config.app,
//         sharing: 'app'});

// }

export async function runSearch(query: string) {
  // run a splunk search
  const searchUrl = createRESTURL("search/jobs");
  const body = new URLSearchParams({
    search: query,
    output_mode: "json",
  });
  const response = await fetch(searchUrl, {
    ...defaultFetchInit,
    method: "POST",
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = await response.json();
  return json?.sid || "";
}

export async function getSearchResults(sid: number) {
  // run a splunk search
  const searchUrl = createRESTURL(`search/jobs/${sid}?output_mode=json`);

  const response = await fetch(searchUrl, {
    ...defaultFetchInit,
    method: "GET",
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const json = await response.json();
  console.log("json", json);
  return json?.sid || "";
}

export async function readCollection(collectionName: string, appName?: string) {
  const kvUrl = createRESTURL(`storage/collections/data/${collectionName}`, {
    app: appName || config.app,
    sharing: "app",
  });
  const fetchInit = defaultFetchInit;
  fetchInit.method = "GET";
  const result = await fetch(kvUrl, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  })
    .then(handleResponse(200))
    .catch(handleError("error"))
    .catch((err) => (err instanceof Object ? "error" : err));
  return result;
}

export async function getAllAppNames() {
  // get all app names
  const apps_endpoint = `/en-US/splunkd/__raw/servicesNS/nobody/-/apps/local?output_mode=json&count=0`; // endpoint for all apps
  const fetchInit = defaultFetchInit;
  fetchInit.method = "GET";
  const result = await fetch(apps_endpoint, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  })
    .then(handleResponse(200))
    .catch(handleError("error"))
    .catch((err) => (err instanceof Object ? "error" : err));

  // filter response to get app names
  const appNames =
    result?.entry?.map((entry: { name: string }) => entry.name) || [];
  return appNames;
}

export async function createNewKVStoreCollection(
  collectionName: string,
  appName: string,
  fields: string[]
) {
  console.log("1s");
  // create a new collection
  const kvUrl = createRESTURL(`storage/collections/config`, {
    app: appName,
    sharing: "app",
  });
  const fetchInit = defaultFetchInit;
  fetchInit.method = "POST";
  // Use form data to send the name as a parameter
  const formData = new URLSearchParams();
  formData.append("name", collectionName);
  const response = await fetch(kvUrl, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
  if (response.status !== 201) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create collection: ${response.status} - ${errorText}`
    );
  }
  // create a lookup definition for the collection
  await createLookupDefinition(collectionName, appName, fields);
}

export async function createLookupDefinition(
  collectionName: string,
  appName: string,
  fields: string[]
) {
  const kvUrl = createRESTURL(`data/transforms/lookups`, {
    app: appName,
    sharing: "app",
  });

  const body = new URLSearchParams({
    name: collectionName,
    external_type: "kvstore",
    collection: collectionName,
    fields_list: fields.join(","),
  });

  const fetchInit = {
    ...defaultFetchInit,
    method: "POST",
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  };
  const response = await fetch(kvUrl, fetchInit);
  if (response.status !== 201) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create collection: ${response.status} - ${errorText}`
    );
  }
  console.log("1b");
  return response;
}

export async function deleteItemFromKVStore(
  collectionName: string,
  itemId: string
) {
  // delete a record from the collection
  const kvUrl = createRESTURL(
    `storage/collections/data/${collectionName}/${itemId}`,
    {
      app: config.app,
      sharing: "app",
    }
  );
  const fetchInit = defaultFetchInit;
  fetchInit.method = "DELETE";
  const result = await fetch(kvUrl, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  })
    .then(handleResponse(200))
    .catch(handleError("error"))
    .catch((err) => (err instanceof Object ? "error" : err));
  return result;
}

export interface KVStoreCollection {
  name: string;
  app: string;
}

export async function getAllCollectionNames(): Promise<KVStoreCollection[]> {
  // get all collection names
  const collections_endpoint = `/en-US/splunkd/__raw/servicesNS/nobody/-/storage/collections/config?output_mode=json&count=0`; // endpoint for all app collections

  const fetchInit = defaultFetchInit;
  fetchInit.method = "GET";
  const result = await fetch(collections_endpoint, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  })
    .then(handleResponse(200))
    .catch(handleError("error"))
    .catch((err) => (err instanceof Object ? "error" : err));

  // filter response to get collection names and app context
  const collectionNames: KVStoreCollection[] =
    result?.entry?.map((entry: { name: string; acl: { app: string } }) => ({
      name: entry.name,
      app: entry.acl?.app || "",
    })) || [];
  return collectionNames;
}

export async function addNewRecordToKVStore(
  value: DataInputAppConfig,
  collectionName: string
) {
  // add a new record with the entered data from the user
  // adding record
  const kvUrl = createRESTURL(`storage/collections/data/${collectionName}`, {
    app: config.app,
    sharing: "app",
  });
  const fetchInit = defaultFetchInit;
  fetchInit.method = "POST";
  const n = await fetch(`${kvUrl}`, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  })
    .then(handleResponse(201))
    .catch(handleError("error"));
  return n;
}

export const runSplunkApiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: string
) => {
  const url = createRESTURL(endpoint + '?output_mode=json', { app: config.app, sharing: "app" });
  const fetchInit = {
    ...defaultFetchInit,
    method,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  };
  if (body) {
    fetchInit.body = body;
  }
  const response = await fetch(url, fetchInit);

  if (!response.ok) {
    throw new Error(
      `Failed: ${response.status} - ${JSON.stringify(await response.json())}`
    );
  }

  if (response instanceof Response) {
    return await response.json();
  } else {
    return response;
  }
};

export async function readItemFromKVStore(
  collectionName: string,
  itemId: string
) {
  return runSplunkApiCall(
    `storage/collections/data/${collectionName}/${itemId}`
  );
}

export async function updateRecordInKVStore(
  collectionName: string,
  value: DataInputAppConfig,
appName?: string,

) {
  const kvUrl = createRESTURL(`storage/collections/data/${collectionName}/${value._key}`, {
    app: appName || config.app,
    sharing: "app",
  });
  const fetchInit = defaultFetchInit;
  fetchInit.method = "POST";
  const response = await fetch(kvUrl, {
    ...fetchInit,
    headers: {
      "X-Splunk-Form-Key": config.CSRFToken,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  })
    .then(handleResponse(200))
  return response;
}


export async function getAllIndexNames(): Promise<string[]> {
  const response = await runSplunkApiCall('/services/data/indexes');
  return response.entry.map((entry: { name: string }) => entry.name);
}

export async function createNewIndex(indexName: string) {
  const requestBody = new URLSearchParams({ name: indexName }).toString();
  return await runSplunkApiCall('/services/data/indexes', "POST", requestBody)
}