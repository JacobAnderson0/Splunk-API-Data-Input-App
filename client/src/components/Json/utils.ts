import jp from 'jsonpath';
import { type JSONElement } from '@splunk/react-ui/JSONTree';

/**
 * Removes properties from a JSON object based on an array of JSONPath expressions.
 * @param obj The JSON object to clone and modify.
 * @param paths Array of JSONPath expressions to remove from the object.
 * @returns A new object with the specified paths removed.
 */
export function removeByJsonPaths(obj: JSONElement, paths: string[]): JSONElement {
    if (!paths.length) return obj;
    const clone = structuredClone(obj);

    for (const path of paths) {
        try {
            const matches = jp.paths(clone, path);

            for (const match of matches) {
                if (match.length < 2) continue;

                const keyToDelete = match[match.length - 1];
                const parentPath = match.slice(0, -1);
                const parent = jp.value(clone, jp.stringify(parentPath));

                if (parent && typeof parent === 'object') {
                    delete parent[keyToDelete];
                }
            }
        } catch {
            // Ignore invalid paths
        }
    }

    return clone;
}
