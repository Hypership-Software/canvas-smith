'use client';

import * as React from 'react';
import {Menu} from '@workday/canvas-kit-react/menu';
import {TertiaryButton} from '@workday/canvas-kit-react/button';
import {Avatar} from '@workday/canvas-kit-react/avatar';
import {Flex} from '@workday/canvas-kit-react/layout';
import {Text} from '@workday/canvas-kit-react/text';
import {type CanvasSystemIcon} from '@workday/canvas-system-icons-web';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/** A single account action rendered as a `Menu.Item`. */
export interface UserMenuItem {
  /** Stable identifier (matched in the menu's `onSelect`). */
  id: string;
  /** Visible action label. */
  label: string;
  /** Optional leading icon. */
  icon?: CanvasSystemIcon;
  /** Invoked when the item is selected (click or keyboard). */
  onSelect?: () => void;
  /** Render as a destructive action (critical foreground), e.g. "Sign out". */
  isDestructive?: boolean;
}

export interface UserMenuProps {
  /** The signed-in user's display name. Shown in the trigger and menu header. */
  name: string;
  /** Optional email shown in the menu header. */
  email?: string;
  /** Optional avatar image URL. Falls back to initials from `name`. */
  avatarUrl?: string;
  /** Account actions rendered in the menu. */
  items: UserMenuItem[];
  /**
   * When `true`, the trigger shows only the avatar (no inline name).
   * Useful for dense top bars. Defaults to `false`.
   */
  compact?: boolean;
  /** Pass-through class name applied to the trigger. */
  className?: string;
}

const triggerStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  gap: system.space.x2,
  paddingInline: system.space.x2,
  paddingBlock: system.space.x1,
  maxInlineSize: '16rem',
});

const triggerNameStyles = createStyles({
  color: cssVar(system.color.fg.default),
  fontWeight: cssVar(system.fontWeight.medium),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const headerStyles = createStyles({
  flexDirection: 'column',
  gap: system.space.zero,
  paddingInline: system.space.x4,
  paddingBlock: system.space.x3,
  borderBlockEnd: `${cssVar(system.shape.half)} solid ${cssVar(system.color.border.divider)}`,
});

const headerNameStyles = createStyles({
  color: cssVar(system.color.fg.stronger),
  fontWeight: cssVar(system.fontWeight.bold),
  margin: 0,
});

const headerEmailStyles = createStyles({
  color: cssVar(system.color.fg.muted.default),
  margin: 0,
});

const destructiveItemStyles = createStyles({
  color: cssVar(system.color.fg.critical.default),
});

/**
 * An account menu: an `Avatar` + name trigger that opens a Canvas `Menu` of
 * account actions. The trigger is a real `TertiaryButton`, so focus, Enter/Space
 * activation, `aria-haspopup` / `aria-expanded`, roving focus, type-ahead, Esc,
 * and return-focus are all handled by the Menu model. The avatar is decorative;
 * the button's accessible name comes from the user's name (or an explicit label
 * in compact mode).
 */
export const UserMenu = ({
  name,
  email,
  avatarUrl,
  items,
  compact = false,
  className,
}: UserMenuProps) => {
  const handleSelect = React.useCallback(
    ({id}: {id: string}) => {
      const selected = items.find(item => item.id === id);
      selected?.onSelect?.();
    },
    [items]
  );

  return (
    <Menu onSelect={handleSelect}>
      <Menu.Target
        as={TertiaryButton}
        cs={triggerStyles}
        className={className}
        aria-label={compact ? `Account menu for ${name}` : undefined}
      >
        <Avatar url={avatarUrl} name={name} objectFit="cover" size="small" isDecorative />
        {!compact ? (
          <Text typeLevel="subtext.large" cs={triggerNameStyles}>
            {name}
          </Text>
        ) : null}
      </Menu.Target>
      <Menu.Popper>
        <Menu.Card>
          <Flex cs={headerStyles}>
            <Text as="p" typeLevel="body.small" cs={headerNameStyles}>
              {name}
            </Text>
            {email != null ? (
              <Text as="p" typeLevel="subtext.large" cs={headerEmailStyles}>
                {email}
              </Text>
            ) : null}
          </Flex>
          <Menu.List>
            {items.map(item => (
              <Menu.Item
                key={item.id}
                data-id={item.id}
                cs={item.isDestructive ? destructiveItemStyles : undefined}
              >
                {item.icon ? <Menu.Item.Icon icon={item.icon} /> : null}
                <Menu.Item.Text>{item.label}</Menu.Item.Text>
              </Menu.Item>
            ))}
          </Menu.List>
        </Menu.Card>
      </Menu.Popper>
    </Menu>
  );
};

export default UserMenu;
