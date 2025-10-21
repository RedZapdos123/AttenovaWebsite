import React from 'react';
import { clsx } from 'clsx';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Alert = ({ variant = 'info', title, children, onClose, className, ...props }) => {
  const variants = {
    success: {
      container: 'alert-success',
      icon: CheckCircleIcon,
    },
    error: {
      container: 'alert-error',
      icon: XCircleIcon,
    },
    warning: {
      container: 'alert-warning',
      icon: ExclamationTriangleIcon,
    },
    info: {
      container: 'alert-info',
      icon: InformationCircleIcon,
    },
  };

  const { container, icon: Icon } = variants[variant];

  return (
    <div className={clsx('alert', container, className)} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <div className={title ? 'text-sm' : ''}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close alert"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
