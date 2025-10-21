import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  SunIcon, 
  MoonIcon, 
  Bars3Icon, 
  XMarkIcon,
  QrCodeIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';

const Navigation = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/signup', label: 'Sign Up', icon: UserGroupIcon },
    { path: '/login', label: 'Login', icon: DocumentTextIcon },
  ];
  
  return (
    <nav className="bg-primary-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <QrCodeIcon className="h-8 w-8 text-white" />
            <Link 
              to="/" 
              className="text-xl font-bold text-white hover:text-primary-200 transition-colors"
            >
              Attenova
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:text-white hover:bg-primary-500'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="border-primary-300 text-primary-100 hover:bg-primary-500 hover:border-primary-400"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="border-primary-300 text-primary-100 hover:bg-primary-500 hover:border-primary-400 min-w-[44px] min-h-[44px]"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="border-primary-300 text-primary-100 hover:bg-primary-500 hover:border-primary-400 min-w-[44px] min-h-[44px]"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-primary-700 text-white'
                        : 'text-primary-100 hover:text-white hover:bg-primary-500'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
