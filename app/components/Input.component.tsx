import React from "react";

type Props = {
  label: string;
  name: string;

  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  defaultValue?: string;
};

export const InputComponent: React.FC<Props> = ({
  label,
  name,

  // optional props
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
  defaultValue = "",
  fullWidth = true,
}) => {
  const columns = fullWidth ? "twelve" : "six";

  return (
    <div className={`${columns} columns mb-10`}>
      <label htmlFor="exampleEmailInput">{label}</label>
      <input
        className="u-full-width"
        type={type}
        placeholder={placeholder || label}
        name={name}
        disabled={disabled}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
};
