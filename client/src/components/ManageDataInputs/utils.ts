import type { JSONElement } from "@splunk/react-ui/JSONTree";
import { removeByJsonPaths } from "../Json/utils";

 /**
   * Fetches JSON data from a URL and applies JSONPath filtering.
   * @param url The URL to fetch data from.
   * @param jsonPaths The JSONPaths to remove from the data.
   * @param setRawData Callback to set the raw data.
   * @param onDataFetched Callback to handle the filtered data as a string.
   * @param setError Callback to set error messages.
   * @param setLoading Callback to set loading state.
   */
  export async function fetchDataPreview(
    url: string,
    jsonPaths: string[],
    setRawData: (data: JSONElement) => void,
    onDataFetched: (data: string) => void,
    setError: (msg: string | null) => void,
    setLoading: (loading: boolean) => void
  ) {
    setError(null);
    setLoading(true);
    onDataFetched('');

    try {
      if (!url) throw new Error("Please enter a URL");
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setRawData(data as JSONElement); // Save the raw data for future filtering
      const filtered = jsonPaths.length ? removeByJsonPaths(data as JSONElement, jsonPaths) : data;
      onDataFetched(JSON.stringify(filtered));
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  }

    export const onJSONPathsChange = (jsonPaths: string[], rawData: JSONElement | null, setFilteredData: (data: JSONElement) => void, onFilteredDataChange: (data: string) => void) => {
      if (!rawData) return;
      const filtered = jsonPaths.length ? removeByJsonPaths(rawData, jsonPaths) : rawData;
      setFilteredData(filtered);
      onFilteredDataChange(JSON.stringify(filtered));
    };
  