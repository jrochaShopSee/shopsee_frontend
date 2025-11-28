import React from "react";

const Label: React.FC<{ label: string; htmlFor: string }> = ({
  label,
  htmlFor,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-gray-700 text-sm font-bold mb-2"
    >
      {label}
    </label>
  );
};

export default Label;
