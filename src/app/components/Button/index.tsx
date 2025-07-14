// import { ReactNode } from 'react';

// interface ButtonProps {
//   children: ReactNode;
//   onClick: () => void;
//   className?: string;
//   type?: 'button' | 'submit' | 'reset';
// }

// export const Button = ({
//   children,
//   onClick,
//   className,
//   type = 'button',
// }: ButtonProps) => {
//   return (
//     <button
//       type={type}
//       className={`px-4 py-3 bg-[#b0db72] hover:bg-[#64a506] text-white rounded-md focus:outline-none font-semibold text-base ${className}`}
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// };

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  children,
  onClick,
  className = '',
  type = 'button',
  isLoading = false,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center px-4 py-3 bg-[#b0db72] hover:bg-[#64a506] text-white rounded-md focus:outline-none font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};



