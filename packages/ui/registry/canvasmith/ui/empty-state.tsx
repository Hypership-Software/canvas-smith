'use client';

import * as React from 'react';
import {Flex} from '@workday/canvas-kit-react/layout';
import {Heading, BodyText} from '@workday/canvas-kit-react/text';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {SystemIconCircle} from '@workday/canvas-kit-react/icon';
import {useUniqueId} from '@workday/canvas-kit-react/common';
import {activityStreamIcon, type CanvasSystemIcon} from '@workday/canvas-system-icons-web';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/** A single call-to-action rendered as a `PrimaryButton` in the empty state. */
export interface EmptyStateAction {
  /** Button label. */
  label: string;
  /** Click handler. */
  onClick: () => void;
  /** Optional leading icon. */
  icon?: CanvasSystemIcon;
}

export interface EmptyStateProps {
  /**
   * Optional illustrative system icon. Decorative — rendered inside a tonal
   * `SystemIconCircle`. Defaults to a generic activity glyph.
   */
  icon?: CanvasSystemIcon;
  /** Headline describing the empty/zero-data state. */
  title: string;
  /** Optional supporting copy explaining what to do next. */
  description?: React.ReactNode;
  /** Optional primary call-to-action. */
  action?: EmptyStateAction;
  /** Pass-through class name. */
  className?: string;
}

const containerStyles = createStyles({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: system.space.x4,
  paddingBlock: system.space.x16,
  paddingInline: system.space.x8,
  minBlockSize: '20rem',
});

const titleStyles = createStyles({
  margin: 0,
  color: cssVar(system.color.fg.stronger),
});

const descriptionStyles = createStyles({
  margin: 0,
  maxInlineSize: '28rem',
  color: cssVar(system.color.fg.muted.default),
});

/**
 * A centered zero-data view: an illustrative icon, a heading, supporting copy,
 * and one clear primary action. Uses semantic muted text for the description
 * and Canvas spacing tokens for vertical rhythm. The icon is decorative
 * (`aria-hidden`); the heading is linked to the region for assistive tech.
 */
export const EmptyState = ({
  icon = activityStreamIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  const titleId = useUniqueId();

  return (
    <Flex as="section" cs={containerStyles} className={className} aria-labelledby={titleId}>
      <SystemIconCircle
        icon={icon}
        size="xl"
        background={cssVar(system.color.bg.alt.soft)}
        color={cssVar(system.color.icon.soft)}
      />
      <Heading id={titleId} as="h2" size="small" cs={titleStyles}>
        {title}
      </Heading>
      {description != null ? (
        <BodyText as="p" size="medium" cs={descriptionStyles}>
          {description}
        </BodyText>
      ) : null}
      {action ? (
        <PrimaryButton icon={action.icon} onClick={action.onClick}>
          {action.label}
        </PrimaryButton>
      ) : null}
    </Flex>
  );
};

export default EmptyState;
