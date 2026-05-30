import * as React from 'react'

import styles from './button.module.css'

/**
 * Button — the marketing-site CTA primitive (NOT a Canvas Kit button).
 *
 * Renders an <a> when `as="a"` or an `href` is provided, otherwise a <button>.
 * `primary` is the brand-blue solid CTA; `ghost` is a quiet bordered/underlined link.
 *
 * Note: this is a CSS-Modules styled element, deliberately separate from Canvas
 * Kit's PrimaryButton (which lives only inside the live demo).
 */

type CommonProps = {
  variant?: 'primary' | 'ghost'
  as?: 'a' | 'button'
  href?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler
  className?: string
}

type ButtonProps = CommonProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement> &
      React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof CommonProps
  >

export function Button({
  variant = 'primary',
  as,
  href,
  children,
  onClick,
  className,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  const renderAsAnchor = as === 'a' || (as === undefined && href !== undefined)

  if (renderAsAnchor) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }

  const { type, ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      type={type ?? 'button'}
      className={classes}
      onClick={onClick}
      {...buttonRest}
    >
      {children}
    </button>
  )
}
