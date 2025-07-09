import React, { useEffect, useState } from 'react';
import Modal from '@splunk/react-ui/Modal';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Select from '@splunk/react-ui/Select';
import { getAllAppNames } from '../../../utils/splunk';

interface NewKVStoreFormProps {
    onCreate: (name: string, app: string, fields: string[]) => void;
    open: boolean;
    onClose: () => void;
    initialFields: string[];
    modalToggle: React.RefObject<HTMLButtonElement | null>;
}

const NewKVStoreForm: React.FC<NewKVStoreFormProps> = ({ onCreate, open, onClose, initialFields, modalToggle }) => {
    const [name, setName] = useState('');
    const [fields, setFields] = useState<string[]>(initialFields);
    const [error, setError] = useState<string | null>(null);
    const [appNames, setAppNames] = useState<string[]>([]);
    const [selectedApp, setSelectedApp] = useState<string>('');

    useEffect(() => {
        if (initialFields.length > 0) {
            setFields(initialFields);
        }
    }, [initialFields]);

    React.useEffect(() => {
        getAllAppNames().then((apps) => {
            setAppNames(apps);
        });
    }, [selectedApp]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name.trim()) {
            setError('KV Store name is required');
            return;
        }
        if (!selectedApp) {
            setError('Please select an app context');
            return;
        }
        if (!fields.length) {
            setError('Please supply at least one field');
            return;
        }
        onCreate(name.trim(), selectedApp, fields);
        setName('');
        setError(null);
        onClose();
    };

    return (
        <Modal
            returnFocus={modalToggle}
            onRequestClose={onClose}
            open={open}
        >
            <Modal.Header title="Create New KV Store Collection" />
            <Modal.Body>
                {error && <Message type="error">{error}</Message>}

                <form onSubmit={handleSubmit}>
                    <ControlGroup label="KV Store Name" required>
                        <Text
                            value={name}
                            onChange={(_, { value }) => setName(value)}
                            required
                            placeholder="Enter KV Store name"
                            autoFocus
                        />
                    </ControlGroup>
                    <ControlGroup label="App Context" required>
                        <Select
                            value={selectedApp}
                            onChange={(_, { value }) => setSelectedApp(String(value))}
                            filter
                            placeholder="Select app context"
                        >
                            {appNames.map((app) => (
                                <Select.Option key={app} value={app} label={app} />
                            ))}
                        </Select>
                    </ControlGroup>
                    <ControlGroup label="Fields (comma separated)" help="to auto populate make sure you preview the data" required>
                        <Text
                            value={fields.join(', ')}
                            onChange={(_, { value }) => setFields(value.split(',').map(f => f.trim()).filter(f => f))}
                            placeholder="field1, field2, field3"
                        />
                    </ControlGroup>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" disabled={!name.trim()} onClick={handleSubmit} label="Create" />
                <Button appearance="secondary" onClick={onClose} label="Cancel" />
            </Modal.Footer>
        </Modal>
    );
};

export default NewKVStoreForm;