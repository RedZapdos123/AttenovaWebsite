import React from 'react';
import { clsx } from 'clsx';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  helperText,
  required,
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
      <input
        type={type}
        className={clsx(
          'input-field',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
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

Input.displayName = 'Input';

export default Input;
