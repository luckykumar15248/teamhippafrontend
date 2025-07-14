interface FormInputProps {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  autoComplete?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  ClassName?: string;
  checked?: boolean;
  options?: { value: string; label: string; disabled?: boolean }[];
  error?: boolean;
  errorMessage?: string;
}

const Input = ({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled = false,
  label,
  required = false,
  ClassName = "",
  checked,
  options,
  error,
  errorMessage,
}: FormInputProps) => {
  const isCheckbox = type === "checkbox";
  const isSelectOption = type === "select";
  const isTextarea = type === "textarea";

  const baseInputClasses = `
   rounded relative block w-full px-3 py-3 border
   placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72]
   focus:z-10 sm:text-sm
   ${ClassName}
  `;
  const inputErrorClasses = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300";

  return (
    <div className={ClassName}>
      {isCheckbox ? (
        <label
          htmlFor={id}
          className="flex items-center space-x-2 text-sm text-gray-900 font-normal"
        >
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`h-[18px] w-[18px] text-[#b0db72] border-gray-300 rounded focus:ring-[#b0db72] ${ClassName}`}
          />
          <span>{label}</span>
        </label>
      ) : isSelectOption ? (
        <>
          {label && (
            <label htmlFor={id} className="text-sm text-gray-900 font-normal">
              {label}
            </label>
          )}
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={`${baseInputClasses} ${inputErrorClasses} pr-10`}
          >
            {!required && <option value="" disabled selected></option>}
            {options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </>
      ) : isTextarea ? (
        <>
          {label && (
            <label htmlFor={id} className="text-sm text-gray-900 font-normal">
              {label}
            </label>
          )}
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            rows={4}
            className={`appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72] focus:z-10 sm:text-sm ${ClassName}`}

          />
        </>
      ) : (
        <>
          {label && (
            <label htmlFor={id} className="text-sm text-gray-900 font-normal">
              {label}
            </label>
          )}
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            required={required}
            className={`appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72] focus:z-10 sm:text-sm ${ClassName}`}
          />
        </>
      )}
      {error && errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
