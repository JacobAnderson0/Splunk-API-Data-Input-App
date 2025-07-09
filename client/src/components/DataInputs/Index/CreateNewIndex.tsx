import React, { useEffect, useState } from 'react';
import Modal from '@splunk/react-ui/Modal';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Select from '@splunk/react-ui/Select';
import { createNewIndex, getAllAppNames } from '../../../utils/splunk';
import { errorToString } from '../../../utils/utils';

interface NewIndexFormProps {
    onCreate: (createdIndexName: string) => void;
    open: boolean;
    onClose: () => void;
    modalToggle: React.RefObject<HTMLButtonElement | null>;
}

const NewIndexForm: React.FC<NewIndexFormProps> = ({ onCreate, open, onClose, modalToggle }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [appNames, setAppNames] = useState<string[]>([]);
    const [selectedApp, setSelectedApp] = useState<string>('');

    useEffect(() => {
        getAllAppNames().then((apps) => {
            setAppNames(apps);
        });
    }, [selectedApp]);

    const handleSubmit = async (e?: React.FormEvent) => {
        try {
            if (e) e.preventDefault();
            if (!name.trim()) {
                setError('Index name is required');
                return;
            }
            if (!selectedApp) {
                setError('Please select an app context');
                return;
            }

            // create new index
            await createNewIndex(name)
        
            onCreate(name.trim());
            setName('');
            setSelectedApp('')
            setError(null);
            onClose();
        } catch (err) {
            setError(errorToString(err))
        }
    };


    return (
        <Modal
            returnFocus={modalToggle}
            onRequestClose={onClose}
            open={open}
        >
            <Modal.Header title="Create New Index" />
            <Modal.Body>
                {error && <Message type="error">{error}</Message>}

                <form onSubmit={handleSubmit}>
                    <ControlGroup label="Index Name" required>
                        <Text
                            value={name}
                            onChange={(_, { value }) => setName(value)}
                            required
                            placeholder="Enter index name"
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

                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" disabled={!name && !selectedApp} onClick={handleSubmit} label="Create" />
                <Button appearance="secondary" onClick={onClose} label="Cancel" />
            </Modal.Footer>
        </Modal>
    );
};

export default NewIndexForm;