import React from 'react';
import { getLanguageIcon } from '../utils/languageIcons';

interface LanguageIconProps {
  id: string;
  className?: string;
  fallback?: string;
}

export const LanguageIcon: React.FC<LanguageIconProps> = ({ id, className = '', fallback }) => {
  const { iconClass, color } = getLanguageIcon(id, fallback);
  const isDevicon = iconClass.startsWith('devicon-');

  return (
    <i
      className={`${iconClass} ${className} transition-transform duration-200`}
      style={!isDevicon && color ? { color } : undefined}
      aria-hidden="true"
    />
  );
};
