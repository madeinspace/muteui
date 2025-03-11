// src/components/NameDisplay.tsx
import React from "react";
import { NameDisplayProps } from "src/types/types";

const NameDisplay: React.FC<NameDisplayProps> = ({ displayName, userName }) => {
  if (!displayName && !userName) return null;

  return (
    <div className="text-lg mb-2">
      {displayName && <span className="font-semibold">{displayName}</span>}
      {displayName && userName && " | "}
      {userName && <span>{userName}</span>}
    </div>
  );
};

export default NameDisplay;
