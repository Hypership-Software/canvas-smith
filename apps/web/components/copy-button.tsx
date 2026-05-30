'use client'

import * as React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'

import styles from './copy-button.module.css'

/**
 * CopyButton — copies `value` to the clipboard and swaps to a check + "Copied"
 * in `--cm-success` for ~1.2s. Announces the change with aria-live="polite".
 */
export interface CopyButtonProps {
  value: string
  label?: string
}

export function CopyButton({ value, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard unavailable (insecure context / denied permission) — fail quietly.
    }
  }, [value])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${styles.button} ${copied ? styles.copied : ''}`.trim()}
      aria-label={copied ? 'Copied to clipboard' : `${label} command to clipboard`}
    >
      <span className={styles.icon} aria-hidden="true">
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </span>
      <span className={styles.text} aria-live="polite">
        {copied ? 'Copied' : label}
      </span>
    </button>
  )
}

function ClipboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="3.5" width="8" height="10" rx="1.5" />
      <path d="M4.5 5.5H3.5A1 1 0 0 0 2.5 6.5V12.5A1 1 0 0 0 3.5 13.5H8.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  )
}
