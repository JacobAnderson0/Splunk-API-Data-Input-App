import React, { useEffect, useState } from 'react';
import { getDataInputsConfigById, updateDataInputConfigById } from '../../utils/dataInputUtils';
import type { DataInputAppConfig } from './DataInputs.types';
import Modal from '@splunk/react-ui/Modal';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import EditKVStorePage from './EditKVStorePage';

interface EditKVStoreInputModalProps {
    id?: string;
    open: boolean;
    modalToggle: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onSuccess?: () => void;

}

const EditKVStoreInputModal: React.FC<EditKVStoreInputModalProps> = ({ id, open, modalToggle, onClose, onSuccess }) => {
    const [data, setData] = useState<DataInputAppConfig>();
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchData() {

            try {
                const result = await getDataInputsConfigById(id || '');
                setError(null);
                setData(result);
            } catch {
                setError('Failed to fetch config');
            }
        }
        if (!id) {
            setError('No ID provided for EditKVStoreInputModal');
            return;
        }

        if (open && id) {
            fetchData();
        }
    }, [id, open]);


    const handleSave = async () => {
        if (data) {
            try {
                console.log('Saving data input config:', data);
                await updateDataInputConfigById(data);
                setError(null);
                if (onSuccess) onSuccess();
                onClose();
            } catch {
                setError('Failed to update config');
            }
        }
    }
    return (
        <Modal
            returnFocus={modalToggle}
            onRequestClose={onClose}
            open={open}
            style={{ width: '90vw', height: '90vh' }}
        >
            <Modal.Header title="Edit KV Store Input" />
            <Modal.Body style={{ height: '100%' }}>
                {error ? (
                    <Message type="error">{error}</Message>
                ) : (
                    <EditKVStorePage dataInputAppConfig={data} setDataInputAppConfig={setData} onSuccess={onClose} />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" onClick={handleSave} label="Save" />
                <Button appearance="secondary" onClick={onClose} label="Cancel" />
            </Modal.Footer>
        </Modal>
    );
};

export default EditKVStoreInputModal;