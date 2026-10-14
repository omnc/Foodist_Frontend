import React, { useEffect, useId, useRef, useState } from 'react';
import { ImageIcon } from '../Icon/Icon';
import styles from './ImageDropzone.module.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

/**
 * Dashed upload area: an "Upload" pill, drag-and-drop and a preview of the chosen image.
 * Controlled through `file` / `onChange(file | null)`; `testId` goes on the hidden file input.
 */
export default function ImageDropzone({ file, onChange, label, testId, className = '' }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (list) => {
    const next = list && list[0];
    if (next && ACCEPTED_TYPES.includes(next.type)) onChange(next);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${className}`}
      onDragOver={onDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png"
        className={styles.input}
        data-testid={testId}
        aria-label={label}
        onChange={(event) => choose(event.target.files)}
      />
      {previewUrl ? <img src={previewUrl} alt="" className={styles.preview} /> : null}
      <div className={`${styles.content} ${previewUrl ? styles.overPreview : ''}`}>
        <label htmlFor={inputId} className={styles.upload}>
          <ImageIcon size={16} />
          Upload
        </label>
        {file ? (
          <p className={styles.hint}>
            <span className={styles.fileName}>{file.name}</span>
            <button type="button" className={styles.remove} onClick={clear}>
              Remove
            </button>
          </p>
        ) : (
          <p className={styles.hint}>
            Choose images or drag &amp; drop it here
            <br />
            JPG, JPEG and PNG. Max 20 MB.
          </p>
        )}
      </div>
    </div>
  );
}
