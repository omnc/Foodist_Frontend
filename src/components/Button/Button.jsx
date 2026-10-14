import React from 'react';
import styles from './Button.module.css';

/**
 * Pill button. `variant` picks the look (primary = yellow, outline = white, text = bare);
 * pass `as={Link}` (or 'a') to render a link with the same styling.
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    icon ? styles.withIcon : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const typeProps = Component === 'button' ? { type: rest.type || 'button' } : {};
  return (
    <Component className={classes} {...typeProps} {...rest}>
      <span className={styles.label}>{children}</span>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
    </Component>
  );
}
