import ControlGroup from "@splunk/react-ui/ControlGroup";
import { useEffect, useState } from "react";
// import Text from '@splunk/react-ui/Text';
import Select from "@splunk/react-ui/Select";
import Button from "@splunk/react-ui/Button";
import React from "react";
import { getAllIndexNames } from "../../../utils/splunk";
import CreateNewIndex from "./CreateNewIndex";

export const NewIndexInput: React.FC = () => {
  const [indexName, setIndexName] = useState("");
  const [showCreateIndexModal, setShowCreateIndexModal] = useState(false);
  const modalToggle = React.useRef<HTMLButtonElement | null>(null);
  const [indexNames, setIndexNames] = useState<string[]>([]);

  const fetchIndexes = async () => {
    const names = await getAllIndexNames();
    setIndexNames(names);
  };

  useEffect(() => {
    fetchIndexes();
  }, []);

  const handleOnCreateIndex = async (createdIndexName: string) => {
    // update list of indexes
    await fetchIndexes();
    setIndexName(createdIndexName);
  };

  return (
    <>
      <ControlGroup label="Select Index:" required>
        <Select
          value={indexName}
          onChange={(_, { value }) => {
            setIndexName(String(value));
          }}
          filter
          placeholder="Select an index"
          style={{ flex: 1, minWidth: "400px" }}
        >
          {indexNames.map((index) => (
            <Select.Option value={index} key={index} label={index} />
          ))}
        </Select>
        <Button
          appearance="secondary"
          onClick={() => setShowCreateIndexModal(true)}
          elementRef={modalToggle}
        >
          Create New Index
        </Button>
      </ControlGroup>
      <CreateNewIndex
        onCreate={handleOnCreateIndex}
        open={showCreateIndexModal}
        onClose={() => setShowCreateIndexModal(false)}
        modalToggle={modalToggle}
      />
    </>
  );
};
