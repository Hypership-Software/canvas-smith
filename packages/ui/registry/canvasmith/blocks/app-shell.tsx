'use client';

import * as React from 'react';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {notificationsIcon, inboxIcon} from '@workday/canvas-system-icons-web';
import type {CanvasSystemIcon} from '@workday/canvas-system-icons-web';

const shellStyles = createStyles({
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: system.color.bg.alt.softer,
});

const headerStyles = createStyles({
  flexShrink: 0,
  minHeight: '64px',
  paddingInline: system.space.x4,
  paddingBlock: system.space.x2,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x4,
  backgroundColor: system.color.bg.default,
  borderBlockEnd: `1px solid ${cssVar(system.color.border.divider)}`,
  boxShadow: system.depth[1],
  zIndex: 1,
});

const brandStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  minWidth: 0,
});

const headerActionsStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  flexShrink: 0,
});

const bodyStyles = createStyles({
  flex: 1,
  minHeight: 0,
});

const railStyles = createStyles({
  flexShrink: 0,
  width: '80px',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: system.color.bg.default,
  borderInlineEnd: `1px solid ${cssVar(system.color.border.divider)}`,
  paddingBlock: system.space.x3,
});

const railGroupStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: system.space.x1,
});

const navItemStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: system.space.x1,
  width: '64px',
  minHeight: '64px',
  border: 'none',
  background: 'transparent',
  borderRadius: system.shape.x1,
  color: system.color.fg.default,
  textDecoration: 'none',
  cursor: 'pointer',
  font: 'inherit',
  padding: system.space.x1,
  '&:hover .cnvs-nav-icon-bg': {
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

const navIconBgStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: system.shape.x1,
  transition: 'background-color 120ms ease',
});

const navIconBgActiveStyles = createStyles({
  backgroundColor: system.color.bg.primary.softer,
});

const navLabelStyles = createStyles({
  ...system.type.subtext.medium,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '72px',
  textAlign: 'center',
});

const navLabelActiveStyles = createStyles({
  color: system.color.fg.primary.default,
  fontWeight: system.fontWeight.bold,
});

const mainStyles = createStyles({
  flex: 1,
  minWidth: 0,
  overflowY: 'auto',
  backgroundColor: system.color.bg.alt.softer,
});

/** A single navigation entry rendered in the fixed icon rail. */
export interface AppShellNavItem {
  /** Stable identifier used for active comparison and React keys. */
  id: string;
  /** Visible label rendered under the icon. */
  label: string;
  /** Leading Canvas system icon. */
  icon: CanvasSystemIcon;
  /** Renders an `<a>` with this href; otherwise a `<button>` is used. */
  href?: string;
  /** Click handler — fires for both link and button rendering. */
  onClick?: () => void;
}

export interface AppShellProps {
  /** Brand element rendered top-left (tenant logo / chip). */
  brand?: React.ReactNode;
  /** Primary rail items, rendered in the top group. */
  nav: AppShellNavItem[];
  /** Secondary rail items pinned to the bottom (e.g. Saved, Settings). */
  footerNav?: AppShellNavItem[];
  /** Currently-active nav item id. Compared against both `nav` and `footerNav`. */
  activeNavId?: string;
  /** Avatar element shown at the far right of the header. */
  avatar?: React.ReactNode;
  /** Overrides the default bell + inbox icon-button cluster. `avatar` is still appended after it. */
  headerActions?: React.ReactNode;
  /** Accessible name for the rail. Defaults to "Main navigation". */
  navAriaLabel?: string;
  /** Main content. */
  children: React.ReactNode;
}

function NavItem({item, isActive}: {item: AppShellNavItem; isActive: boolean}) {
  const iconBgClass = isActive
    ? `cnvs-nav-icon-bg ${navIconBgStyles} ${navIconBgActiveStyles}`
    : `cnvs-nav-icon-bg ${navIconBgStyles}`;
  const labelClass = isActive
    ? `${navLabelStyles} ${navLabelActiveStyles}`
    : navLabelStyles;

  const inner = (
    <>
      <span className={iconBgClass}>
        <SystemIcon
          icon={item.icon}
          size="sm"
          color={
            isActive ? system.color.icon.primary.default : system.color.icon.default
          }
        />
      </span>
      <span className={labelClass}>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={navItemStyles}
        aria-current={isActive ? 'page' : undefined}
        onClick={item.onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={navItemStyles}
      aria-current={isActive ? 'page' : undefined}
      onClick={item.onClick}
    >
      {inner}
    </button>
  );
}

/**
 * AppShell — Workday product chrome: top white header (brand + bell/inbox/avatar),
 * fixed 80px icon rail with stacked icon+label entries, and a scrollable main
 * region. The rail is intentionally not collapsible — it matches real Workday
 * product chrome 1:1.
 */
export const AppShell = ({
  brand,
  nav,
  footerNav,
  activeNavId,
  avatar,
  headerActions,
  navAriaLabel = 'Main navigation',
  children,
}: AppShellProps) => {
  const mainId = useUniqueId();
  const defaultActions = (
    <>
      <TertiaryButton icon={notificationsIcon} aria-label="Notifications" />
      <TertiaryButton icon={inboxIcon} aria-label="Inbox" />
    </>
  );

  return (
    <Flex cs={shellStyles} flexDirection="column">
      <Flex as="header" cs={headerStyles}>
        <Flex cs={brandStyles}>{brand}</Flex>
        <Flex cs={headerActionsStyles}>
          {headerActions ?? defaultActions}
          {avatar}
        </Flex>
      </Flex>

      <Flex cs={bodyStyles}>
        <Flex as="nav" aria-label={navAriaLabel} cs={railStyles}>
          <Box cs={railGroupStyles}>
            {nav.map(item => (
              <NavItem key={item.id} item={item} isActive={item.id === activeNavId} />
            ))}
          </Box>
          {footerNav && footerNav.length > 0 ? (
            <Box cs={railGroupStyles}>
              {footerNav.map(item => (
                <NavItem key={item.id} item={item} isActive={item.id === activeNavId} />
              ))}
            </Box>
          ) : null}
        </Flex>

        <Box as="main" id={mainId} cs={mainStyles}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppShell;
