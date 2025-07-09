import ControlGroup from '@splunk/react-ui/ControlGroup';
import React, { useState } from 'react';
import Text from '@splunk/react-ui/Text';
import type { DataInputAppConfig, DataInputMode } from './DataInputs.types';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import FormRows from '@splunk/react-ui/FormRows';
import { createNewKVStoreCollection, getAllCollectionNames, type KVStoreCollection } from '../../utils/splunk';
import NewKVStoreForm from '../DataInputs/KVStore/NewKVStoreForm';
import { generateSelectedOutputString } from '../../utils/dataInputUtils';
import RadioList from '@splunk/react-ui/RadioList';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';


interface KVStoreDataFormProps {
    dataInputAppConfig?: DataInputAppConfig;
    setDataInputAppConfig?: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    fetchDataPreview: (url: string, jsonPaths: string[]) => Promise<void>;
    fieldsForKvStoreCreation: string[];
    loading: boolean;
    handleSave: (formData: DataInputAppConfig, clearInputs?: () => void) => void;
    setError: (message: string) => void;
    onJSONPathsChange: (jsonPaths: string[]) => void;
    setJsonPreview?: (data: string) => void;
}

const KVStoreDataForm: React.FC<KVStoreDataFormProps> = (props) => {
    const config: Partial<DataInputAppConfig> = props.dataInputAppConfig || {};
    const modalToggle = React.useRef<HTMLButtonElement | null>(null);
    const [collectionNames, setCollectionNames] = useState<KVStoreCollection[]>([]);
    const [showCreateKVModal, setShowCreateKVModal] = useState(false);

    const [name, setInputName] = useState(config.name ?? '');
    const [dataInputType, setDataInputType] = useState<string>(config.input_type ?? 'kvstore');
    const [url, setUrl] = useState(config.url ?? "https://dummyjson.com/products");
    const [http_headers, setHttpHeaders] = useState<string[]>(config.http_headers ?? [""]);
    const [cronExpression, setCronExpression] = useState(config.cron_expression ?? '0 * * * *');
    const [selected_output_location, setSelectedCollection] = useState<string>(config.selected_output_location ?? '');
    const [mode, setMode] = useState<DataInputMode>(config.mode ?? 'overwrite');


    const updateConfigField = <K extends keyof DataInputAppConfig>(
        key: K,
        value: DataInputAppConfig[K]
    ) => {
        if (props.setDataInputAppConfig) {
            props.setDataInputAppConfig(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    // Use a string array for JSONPath values
    const [jsonPathValues, setJsonPathValues] = useState<string[]>(
        config.excluded_json_paths && config.excluded_json_paths.length > 0
            ? config.excluded_json_paths
            : [""]
    );

    React.useEffect(() => {
        getAllCollectionNames().then(result => {
            setCollectionNames(result);
        });
    }, []);

    // Add new JSONPath row
    const handleNewJsonPathExclusion = () => {
        setJsonPathValues((prev) => {
            const updated = [...prev, ""];
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Remove a JSONPath row by index
    const handleRemoveJsonPathRow = (index: number) => {
        if (index === 0) return; // Prevent removing the first row
        setJsonPathValues((prev) => {
            if (prev.length === 1) return prev; // Prevent removing the last row
            const updated = prev.filter((_, i) => i !== index);
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Handle Text value change in a row (accept value: string)
    const handleJsonPathTextChange = (value: string, { index }: { index: number }) => {
        setJsonPathValues((prev) => {
            const updated = prev.map((v, i) => (i === index ? value : v));
            props.onJSONPathsChange(updated.filter(Boolean));
            updateConfigField('excluded_json_paths', updated.filter(Boolean));
            return updated;
        });
    };

    // Render controlled rows with ColumnLayout.Row
    const controlledJsonPathRows = jsonPathValues.map((value, i) => (
        <FormRows.Row index={i} key={i}>
            <div style={{ display: 'flex'}}>
                <div style={{ flexGrow: 1, marginRight: '8px', minWidth: 0 }}>
                    <Text
                        style={{ width: '100%', minWidth: i === 0 ? '577px' : '542px', fontSize: '1.1em' }}
                        placeholder="e.g. $.bar[*].baz"
                        value={value}
                        onChange={(_, { value }) => handleJsonPathTextChange(value, { index: i })}
                    />
                </div>
                {i !== 0 && (
                    <Button
                        inline
                        appearance="secondary"
                        onClick={() => handleRemoveJsonPathRow(i)}
                        label=""
                        icon={<TrashCanCross />}
                    />
                )}
            </div>
        </FormRows.Row>
    ));

    // Add new HTTP header row
    const handleNewHttpHeader = () => {
        setHttpHeaders((prev) => [...prev, ""]);
    };

    // Remove an HTTP header row by index
    const handleRemoveHttpHeader = (index: number) => {
        if (index === 0) return; // Prevent removing the first row
        setHttpHeaders((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    // Handle Text value change in a header row
    const handleHttpHeaderTextChange = (value: string, { index }: { index: number }) => {
        setHttpHeaders((prev) => {
            const updated = prev.map((v, i) => (i === index ? value : v));
            updateConfigField('http_headers', updated.filter(Boolean));
            return updated;
        });
    };

    // Render controlled rows for HTTP headers
    const controlledHttpHeaderRows = http_headers.map((value, i) => (
        <FormRows.Row index={i} key={i}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1, marginRight: '8px', minWidth: 0 }}>
                    <Text
                        style={{ width: '100%', minWidth: i === 0 ? '577px' : '542px', fontSize: '1.1em' }}
                        placeholder="Header: Value"
                        value={value}
                        onChange={(_, { value }) => handleHttpHeaderTextChange(value, { index: i })}
                    />
                </div>
                {i !== 0 && (
                    <Button
                        inline
                        appearance="secondary"
                        onClick={() => handleRemoveHttpHeader(i)}
                        label=""
                        icon={<TrashCanCross />}
                    />
                )}
            </div>
        </FormRows.Row>
    ));

    // Collect JSONPath values from all Text fields in rows
    const getPaths = () => jsonPathValues.filter(Boolean);
    // Function to clear all input fields
    const clearInputs = () => {
        setInputName('');
        setDataInputType('kvstore');
        setUrl('https://dummyjson.com/products');
        setCronExpression('0 * * * *');
        setSelectedCollection('');
        setMode('overwrite');
        setJsonPathValues([""]);
        setHttpHeaders([""]);
        props.onJSONPathsChange([]);
        props.setJsonPreview && props.setJsonPreview('')
    };

    return (
        <div>
            <ControlGroup label="Input Name:" required>
                <Text
                    value={name}
                    onChange={(_, { value }) => {
                        updateConfigField('name', value);
                        setInputName(value)
                    }}
                    placeholder="Enter input name"
                    required
                    canClear
                />
            </ControlGroup>
            <ControlGroup label="API URL:" required>
                <Text
                    value={url}
                    onChange={(_, { value }) => {updateConfigField('url', value); setUrl(value)}}
                    disabled={props.loading}
                    canClear
                    required
                />
                <Button
                    type="submit"
                    disabled={props.loading}
                    onClick={() => props.fetchDataPreview(url, getPaths())}
                >
                    {props.loading ? <WaitSpinner size="medium" /> : "Fetch"}
                </Button>
            </ControlGroup>
                <ControlGroup label="HTTP Headers" tooltip="Add one or more HTTP headers in the format 'Header: Value'">
                <FormRows
                    onRequestAdd={handleNewHttpHeader}
                    addLabel="Add HTTP Header"
                >
                    {controlledHttpHeaderRows}
                </FormRows>
            </ControlGroup>
            <ControlGroup label="Cron Expression:" required tooltip="Cron expression for scheduling data input">
                <Text
                    value={cronExpression}
                    onChange={(_, { value }) => {updateConfigField('cron_expression', value); setCronExpression(value)}}
                    placeholder="0 * * * *"
                    required
                />
            </ControlGroup>
            <ControlGroup label="Exclude JSONPaths" tooltip="Provide one or more JSONPath expressions to exclude fields from the JSON.">
                <FormRows
                    onRequestAdd={handleNewJsonPathExclusion}
                    addLabel="Add Exclude JSONPath"
                >
                    {controlledJsonPathRows}
                </FormRows>
            </ControlGroup>
        
            <ControlGroup label="Select KV Store Collection:" required>
                <Select
                    value={selected_output_location}
                    onChange={(_, { value }) => {updateConfigField('selected_output_location', String(value)); setSelectedCollection(String(value))}}
                    filter
                    placeholder="Filter collections..."
                    style={{ flex: 1, minWidth: '400px' }}
                >
                    {collectionNames.map((collection) => (
                        <Select.Option value={`${collection.app}/${collection.name}`} key={`${collection.name} (${collection.app})`} label={`${collection.name} (${collection.app})`} />
                    ))}
                </Select>
                <Button appearance="secondary" onClick={() => setShowCreateKVModal(true)} elementRef={modalToggle}>
                    Create New KV Store
                </Button>
            </ControlGroup>
            <NewKVStoreForm
                open={showCreateKVModal}
                onClose={() => setShowCreateKVModal(false)}
                initialFields={props.fieldsForKvStoreCreation}
                onCreate={async (name, app, fields) => {
                    try {
                        await createNewKVStoreCollection(name, app, fields);
                        // Refresh collections and select the new one
                        const result = await getAllCollectionNames();
                        setCollectionNames(result);
                        setSelectedCollection(generateSelectedOutputString(app, name));
                        setShowCreateKVModal(false);
                    }
                    catch (err) {
                        props.setError(`Failed to create KV Store collection: ${err instanceof Error ? err.message : 'Unknown error'}`);
                        return;
                    }

                }}
                modalToggle={modalToggle} />
            <ControlGroup label="Mode:" tooltip="How would you like to manage the existing data in the collection?" required>

                <RadioList value={mode} onChange={(_, { value }) => {
                    setMode(value as DataInputMode);
                    updateConfigField('mode', value as DataInputMode);
                }}>
                    <RadioList.Option value={"overwrite"}>overwrite</RadioList.Option>
                </RadioList>

            </ControlGroup>
            <br />
            {/* assume if dataInputAppConfig is passed in save logic is being handled else where (edit mode) */}
            {!props.dataInputAppConfig && (
                <Button
                    appearance="primary"
                    onClick={() => {
                        props.handleSave(
                            {
                                name,
                                input_type: dataInputType,
                                url,
                                http_headers,
                                excluded_json_paths: getPaths(),
                                enabled: true,
                                cron_expression: cronExpression,
                                selected_output_location: selected_output_location,
                                mode
                            } as DataInputAppConfig, clearInputs
                        );
                    }}
                >
                    Save Data Input
                </Button>
            )}
        </div>
    );
};

export default KVStoreDataForm