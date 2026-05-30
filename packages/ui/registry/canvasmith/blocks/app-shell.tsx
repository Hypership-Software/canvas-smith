'use client';

import * as React from 'react';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {SidePanel, useSidePanelModel} from '@workday/canvas-kit-react/side-panel';
import {Heading} from '@workday/canvas-kit-react/text';
import {useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import type {CanvasSystemIcon} from '@workday/canvas-system-icons-web';

const shellStyles = createStyles({
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: system.color.bg.alt.softer,
});

const headerStyles = createStyles({
  flexShrink: 0,
  minHeight: system.space.x16,
  paddingInline: system.space.x6,
  paddingBlock: system.space.x2,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x4,
  backgroundColor: system.color.bg.default,
  borderBlockEnd: `1px solid ${cssVar(system.color.border.divider)}`,
  boxShadow: system.depth[1],
});

const brandStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  minWidth: 0,
});

const brandTitleStyles = createStyles({
  margin: system.space.zero,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const headerActionStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  flexShrink: 0,
});

const bodyStyles = createStyles({
  flex: 1,
  minHeight: 0,
});

const navStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x1,
  paddingInline: system.space.x3,
  paddingBlock: system.space.x4,
  overflowY: 'auto',
});

const navItemStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: system.space.x3,
  paddingInline: system.space.x3,
  paddingBlock: system.space.x3,
  borderRadius: system.shape.x1,
  color: system.color.fg.default,
  textDecoration: 'none',
  width: '100%',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  textAlign: 'start',
  font: 'inherit',
  ...system.type.body.small,
  '&:hover': {
    backgroundColor: system.color.bg.alt.soft,
  },
  '&:focus-visible': {
    outline: '2px solid transparent',
    boxShadow: `inset 0 0 0 2px ${cssVar(
      system.color.border.input.inverse
    )}, 0 0 0 2px ${cssVar(system.color.border.input.inverse)}, 0 0 0 4px ${cssVar(
      system.color.border.primary.default
    )}`,
  },
});

const navItemActiveStyles = createStyles({
  backgroundColor: system.color.bg.primary.softer,
  color: system.color.fg.primary.default,
  fontWeight: system.fontWeight.bold,
  '&:hover': {
    backgroundColor: system.color.bg.primary.softer,
  },
});

const navLabelStyles = createStyles({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const mainStyles = createStyles({
  flex: 1,
  minWidth: 0,
  padding: system.space.x8,
  overflowY: 'auto',
  backgroundColor: system.color.bg.alt.softer,
});

/** A single navigation entry rendered in the collapsible side rail. */
export interface AppShellNavItem {
  /** Stable identifier used for active comparison and React keys. */
  id: string;
  /** Visible label; hidden (icon-only) when the panel is collapsed. */
  label: string;
  /** Leading Canvas system icon (always visible). */
  icon: CanvasSystemIcon;
  /** Renders an `<a>` with this href; otherwise a `<button>` is used. */
  href?: string;
  /** Click handler — fires for both link and button rendering. */
  onClick?: () => void;
}

export interface AppShellProps {
  /** Brand cluster shown at the start of the header (logo, product name). */
  brand?: React.ReactNode;
  /** Navigation entries for the collapsible side rail. */
  nav: AppShellNavItem[];
  /** The currently active nav item id (drives highlight + `aria-current`). */
  activeNavId?: string;
  /** Action cluster shown at the end of the header (e.g. a UserMenu). */
  headerActions?: React.ReactNode;
  /** Accessible name for the side navigation rail. Defaults to "Main navigation". */
  navAriaLabel?: string;
  /** Heading shown above the nav items (hidden when collapsed). Defaults to "Navigation". */
  navHeading?: string;
  /** Whether the side panel starts expanded. Defaults to `true`. */
  defaultExpanded?: boolean;
  /** Main content region. */
  children: React.ReactNode;
}

/**
 * AppShell — a full application scaffold: a sticky top header (brand + actions),
 * a collapsible Canvas SidePanel for navigation, and a scrollable main region.
 *
 * The SidePanel model animates the 320↔64px width transition and wires the
 * toggle button's `aria-controls` / `aria-pressed` automatically.
 */
export const AppShell = ({
  brand,
  nav,
  activeNavId,
  headerActions,
  navAriaLabel = 'Main navigation',
  navHeading = 'Navigation',
  defaultExpanded = true,
  children,
}: AppShellProps) => {
  const model = useSidePanelModel({
    initialTransitionState: defaultExpanded ? 'expanded' : 'collapsed',
  });
  const expanded = model.state.transitionState === 'expanded';
  const mainId = useUniqueId();

  return (
    <Flex cs={shellStyles} flexDirection="column">
      <Flex as="header" cs={headerStyles}>
        <Flex cs={brandStyles}>
          {brand ?? (
            <Heading as="h1" size="small" cs={brandTitleStyles}>
              Workspace
            </Heading>
          )}
        </Flex>
        {headerActions ? <Flex cs={headerActionStyles}>{headerActions}</Flex> : null}
      </Flex>

      <Flex cs={bodyStyles}>
        <SidePanel model={model} variant="alternate">
          <SidePanel.ToggleButton />
          <SidePanel.Heading size="small">{navHeading}</SidePanel.Heading>
          <Box as="nav" aria-label={navAriaLabel} cs={navStyles}>
            {nav.map(item => {
              const isActive = item.id === activeNavId;
              const className = isActive
                ? `${navItemStyles} ${navItemActiveStyles}`
                : navItemStyles;
              const inner = (
                <>
                  <SystemIcon
                    icon={item.icon}
                    size="sm"
                    color={
                      isActive
                        ? system.color.icon.primary.default
                        : system.color.icon.default
                    }
                  />
                  {expanded ? <span className={navLabelStyles}>{item.label}</span> : null}
                </>
              );

              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={className}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={expanded ? undefined : item.label}
                    onClick={item.onClick}
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className={className}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={expanded ? undefined : item.label}
                  onClick={item.onClick}
                >
                  {inner}
                </button>
              );
            })}
          </Box>
        </SidePanel>

        <Box as="main" id={mainId} cs={mainStyles}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppShell;
