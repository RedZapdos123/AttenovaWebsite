import React from 'react';
import { clsx } from 'clsx';

const Card = React.forwardRef(({ className, children, hover = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'card',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('px-6 py-4 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={clsx('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={clsx('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
