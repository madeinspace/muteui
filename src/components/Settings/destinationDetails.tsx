// src/components/DestinationDetails.tsx
import React from "react";
import { DestinationDetailsProps } from "src/types/types";

const DestinationDetails: React.FC<DestinationDetailsProps> = ({
  destination,
}) => {
  const { active, dest, index, module } = destination;

  return (
    <div className="mt-4 w-full">
      <h3 className="text-xl mb-2">Destination Settings</h3>

      <pre className="bg-black text-green-400 p-4 rounded-md overflow-auto w-full">
        <code className="font-mono text-sm">
          Active: {active ? "Yes" : "No"}
          {"\n"}
          Destination: {dest}
          {"\n"}
          Index: {index}
          {"\n"}
          Module: {module}
        </code>
      </pre>
    </div>
  );
};

export default DestinationDetails;
