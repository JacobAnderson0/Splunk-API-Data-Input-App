import { useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import type { DataInputAppConfig } from '../components/ManageDataInputs/DataInputs.types';
import NewKVStoreDataInputForm from '../DataInputs/KVStore/NewDataInputForm';
import JSONViewer from '../Json/JsonViewer';

interface EditKVStorePageProps {
    dataInputAppConfig: DataInputAppConfig;
        setDataInputAppConfig: React.Dispatch<React.SetStateAction<DataInputAppConfig>>;
    
    onSuccess: () => void;
}

export default function EditKVStorePage({ dataInputAppConfig, setDataInputAppConfig, onSuccess }: EditKVStorePageProps) {
    const [jsonData, setJsonData] = useState<string>('');

    return (
        <ColumnLayout gutter={100}>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={6}>
                    <NewKVStoreDataInputForm
                        dataInputAppConfig={dataInputAppConfig}
                        setDataInputAppConfig={setDataInputAppConfig}
                        onDataFetched={(data: string) => {
                            setJsonData(data);
                        }}
                        onSuccess={onSuccess}
                    />
                </ColumnLayout.Column>
                <ColumnLayout.Column span={6}>
                    <JSONViewer initialData={jsonData} />
                </ColumnLayout.Column>
            </ColumnLayout.Row>
        </ColumnLayout>
    );
}
