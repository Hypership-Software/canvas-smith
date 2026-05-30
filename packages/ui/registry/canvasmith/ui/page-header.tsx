'use client';

import * as React from 'react';
import {Breadcrumbs} from '@workday/canvas-kit-react/breadcrumbs';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {Heading, BodyText} from '@workday/canvas-kit-react/text';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/** A single breadcrumb entry. The final crumb (no `href`) renders as the current page. */
export interface PageHeaderCrumb {
  /** Visible crumb label. */
  label: string;
  /** Destination. Omit on the final/current crumb. */
  href?: string;
}

export interface PageHeaderProps {
  /** Page title rendered as the primary heading. */
  title: string;
  /** Optional supporting subtitle/description shown beneath the title. */
  subtitle?: React.ReactNode;
  /** Optional breadcrumb trail rendered above the title. */
  breadcrumbs?: PageHeaderCrumb[];
  /**
   * Optional action cluster, right-aligned on the title row. Pass Canvas
   * buttons (e.g. `PrimaryButton` / `SecondaryButton`).
   */
  actions?: React.ReactNode;
  /** Heading level for the title element. Defaults to `h1`. */
  headingLevel?: 'h1' | 'h2';
  /** Pass-through class name. */
  className?: string;
}

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x4,
  paddingBlockEnd: system.space.x4,
  borderBlockEnd: `${cssVar(system.shape.half)} solid ${cssVar(system.color.border.divider)}`,
});

const titleRowStyles = createStyles({
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: system.space.x4,
  flexWrap: 'wrap',
});

const titleStyles = createStyles({
  margin: 0,
  color: cssVar(system.color.fg.stronger),
});

const subtitleStyles = createStyles({
  margin: 0,
  marginBlockStart: system.space.x1,
  color: cssVar(system.color.fg.muted.default),
});

const actionsStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x3,
  flexWrap: 'wrap',
  flexShrink: 0,
});

/**
 * A page-level header: an optional `Breadcrumbs` trail (named landmark), a
 * primary `Heading` with optional subtitle, and a right-aligned action button
 * cluster. Lays out on a wrapping `Flex` using `system.space` rhythm so the
 * actions drop below the title gracefully on narrow viewports.
 */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  headingLevel = 'h1',
  className,
}: PageHeaderProps) => (
  <Box as="header" cs={containerStyles} className={className}>
    {breadcrumbs && breadcrumbs.length > 0 ? (
      <Breadcrumbs aria-label="Breadcrumb">
        <Breadcrumbs.List>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !crumb.href) {
              return (
                <Breadcrumbs.CurrentItem key={`${crumb.label}-${index}`}>
                  {crumb.label}
                </Breadcrumbs.CurrentItem>
              );
            }
            return (
              <Breadcrumbs.Item key={`${crumb.label}-${index}`}>
                <Breadcrumbs.Link href={crumb.href}>{crumb.label}</Breadcrumbs.Link>
              </Breadcrumbs.Item>
            );
          })}
        </Breadcrumbs.List>
      </Breadcrumbs>
    ) : null}

    <Flex cs={titleRowStyles}>
      <Box cs={{minInlineSize: 0}}>
        <Heading as={headingLevel} size="medium" cs={titleStyles}>
          {title}
        </Heading>
        {subtitle != null ? (
          <BodyText as="p" size="small" cs={subtitleStyles}>
            {subtitle}
          </BodyText>
        ) : null}
      </Box>
      {actions != null ? <Flex cs={actionsStyles}>{actions}</Flex> : null}
    </Flex>
  </Box>
);

export default PageHeader;
