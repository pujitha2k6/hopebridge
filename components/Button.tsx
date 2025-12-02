import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  isLoading = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-3 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-secondary shadow-soft",
    secondary: "bg-accent text-gray-900 hover:bg-yellow-400",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-textLight hover:text-primary hover:bg-gray-100 shadow-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};