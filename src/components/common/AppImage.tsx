import { useMemo, useState } from 'react';

export interface AppImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const AppImage = ({ src, alt, className = '', fallbackLabel }: Readonly<AppImageProps>) => {
  const [hasError, setHasError] = useState(false);
  const label = fallbackLabel || alt;
  const initials = useMemo(() => getInitials(label), [label]);

  if (!src || hasError) {
    return (
      <div className={`app-image-fallback ${className}`.trim()} role="img" aria-label={alt}>
        <span>{initials || <i className="pi pi-image" aria-hidden="true" />}</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setHasError(true)} />;
};

export default AppImage;
