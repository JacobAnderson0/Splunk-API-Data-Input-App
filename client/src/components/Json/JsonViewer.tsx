import { useMemo } from 'react';
import JSONTree, { type JSONElement } from '@splunk/react-ui/JSONTree';
import Message from '@splunk/react-ui/Message';
import Heading from '@splunk/react-ui/Heading';

interface JSONViewerProps {
    initialData: string;
}

export default function JSONViewer({ initialData }: JSONViewerProps) {
    const { parsedJSON, isValidJSON } = useMemo(() => {
        if (!initialData) return { parsedJSON: null, isValidJSON: true };
        try {
            const parsed = JSON.parse(initialData);
            return { parsedJSON: parsed as JSONElement, isValidJSON: true };
        } catch {
            return { parsedJSON: null, isValidJSON: false };
        }
    }, [initialData]);

    const JSONTreeMemo = useMemo(() => {
        return parsedJSON ? (
            <div><JSONTree json={parsedJSON} defaultExpanded /></div>
        ) : (
            <Message type="info">complete fetch data to see preview</Message>
        );
    }, [parsedJSON]);

    return (
        <div>
            <Heading level={2}>Preview</Heading>
            <br />
            {isValidJSON ? (
                JSONTreeMemo
            ) : (
                <p color="error" style={{ marginTop: 1, textAlign: 'center' }}>
                    Invalid JSON data provided.
                </p>
            )}
        </div>
    );
}
