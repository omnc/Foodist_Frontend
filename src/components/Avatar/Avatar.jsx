import React from 'react';
import { AvatarIcon } from '../Icon/Icon';
import styles from './Avatar.module.css';

/** Round profile picture; falls back to the yellow placeholder when the user has no photo. */
export default function Avatar({ src, size = 50, alt = '', className = '' }) {
  const box = { width: size, height: size };
  if (!src) return <AvatarIcon size={size} className={className} />;
  return <img src={src} alt={alt} className={`${styles.avatar} ${className}`} style={box} />;
}
