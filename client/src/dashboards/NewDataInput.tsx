import { useCallback, useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import NewKVStoreDataInputForm from '../components/DataInputs/KVStore/NewDataInputForm';
import JSONViewer from '../components/Json/JsonViewer';
import MessageBar from '@splunk/react-ui/MessageBar';
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createDOMID } from '@splunk/ui-utils/id';
import TabBar from '@splunk/react-ui/TabBar';
import { NewIndexInput } from '../components/DataInputs/Index/NewIndexInput';

export default function NewDataInput() {
  const [jsonData, setJsonData] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState('kvstore');
  const headingId = createDOMID('data-input-success');


  const handleTabChange = useCallback(
    (
      _: React.SyntheticEvent,
      { selectedTabId }: { selectedTabId?: string }
    ) => {
      if (selectedTabId) {
        setActiveTabId(selectedTabId);
      }
    },
    []
  );

  return (
    <ColumnLayout gutter={100}>
      <ColumnLayout.Row>
        <ColumnLayout.Column span={6}>
          {successMessage && (
            <MessageBar
            style={{marginBottom: "15px"}}
              type="success"
              aria-labelledby={headingId}
              onRequestClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </MessageBar>
          )}
          <TabBar style={{marginBottom: '25px', width: '80%'}} activeTabId={activeTabId} onChange={handleTabChange}>
            <TabBar.Tab label="KV Store" tabId="kvstore" />
            <TabBar.Tab label="Index" tabId="index" />
          </TabBar>
          {activeTabId === 'kvstore' && (
            <NewKVStoreDataInputForm
              onDataFetched={(data: string) => {
                setJsonData(data);
              }}
              onSuccess={() => setSuccessMessage('Successfully added data input to KV Store.')}
            />
          )}
          {activeTabId === 'index' && (
            <NewIndexInput />
          )}
        </ColumnLayout.Column>
        <ColumnLayout.Column span={6}>
          <JSONViewer initialData={jsonData} />
        </ColumnLayout.Column>
      </ColumnLayout.Row>
    </ColumnLayout>
  );
}
