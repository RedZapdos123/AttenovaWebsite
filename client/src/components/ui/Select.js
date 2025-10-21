import React from 'react';
import { clsx } from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Select = React.forwardRef(({
  className,
  children,
  error,
  label,
  helperText,
  required,
  placeholder,
  ...props
}, ref) => {
  const id = props.id || props.name;
  
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            'label',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={clsx(
            'input-field appearance-none pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-sm text-gray-600 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
