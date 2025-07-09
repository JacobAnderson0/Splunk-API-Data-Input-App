export type DataInputMode = 'overwrite';

export interface DataInputAppConfig {
    _key?: string;
    name: string;
    input_type: string;
    url: string;
    http_headers: string[];
    excluded_json_paths: string[];
    enabled: boolean;
    mode: DataInputMode;
    cron_expression: string;
    selected_output_location: string;
}