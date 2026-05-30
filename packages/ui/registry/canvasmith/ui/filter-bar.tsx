'use client';

import * as React from 'react';
import {Flex} from '@workday/canvas-kit-react/layout';
import {InputGroup, TextInput} from '@workday/canvas-kit-react/text-input';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {Pill} from '@workday/canvas-kit-react/pill';
import {searchIcon} from '@workday/canvas-system-icons-web';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/** An active, removable filter chip rendered as a Canvas `Pill`. */
export interface FilterChip {
  /** Stable identifier passed back to `onRemoveChip`. */
  id: string;
  /** Visible chip label. */
  label: string;
}

export interface FilterBarProps {
  /** Controlled value of the search field. */
  searchValue?: string;
  /** Called with the new search string on every keystroke. */
  onSearchChange?: (value: string) => void;
  /** Placeholder for the search field. Defaults to "Search". */
  searchPlaceholder?: string;
  /** Accessible label for the search field. Defaults to "Search". */
  searchAriaLabel?: string;
  /**
   * Filter controls (e.g. `Select` / `Combobox` / `SegmentedControl`) rendered
   * inline after the search field.
   */
  filters?: React.ReactNode;
  /** Active filter chips shown on a second wrapping row. */
  chips?: FilterChip[];
  /** Called with a chip id when its remove button is activated. */
  onRemoveChip?: (id: string) => void;
  /**
   * Extra trailing content (e.g. a "Clear all" `TertiaryButton`) aligned to the
   * end of the toolbar row.
   */
  children?: React.ReactNode;
  /** Pass-through class name. */
  className?: string;
}

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x3,
});

const toolbarRowStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x3,
  flexWrap: 'wrap',
});

const searchGroupStyles = createStyles({
  flexGrow: 1,
  flexBasis: '16rem',
  maxInlineSize: '24rem',
});

const trailingStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  marginInlineStart: 'auto',
});

const chipRowStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x2,
  flexWrap: 'wrap',
});

/**
 * A responsive filter toolbar: a leading search field (with inset search icon),
 * inline `Select` / `Combobox` / `SegmentedControl` filters, optional trailing
 * actions, and a wrapping row of removable filter `Pill` chips. Lays out on a
 * wrapping `Flex` with `system.space` gaps so it reflows on narrow viewports.
 */
export const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  searchAriaLabel = 'Search',
  filters,
  chips,
  onRemoveChip,
  children,
  className,
}: FilterBarProps) => (
  <Flex as="section" role="search" aria-label="Filters" cs={containerStyles} className={className}>
    <Flex cs={toolbarRowStyles}>
      <InputGroup cs={searchGroupStyles}>
        <InputGroup.InnerStart pointerEvents="none">
          <SystemIcon icon={searchIcon} size="sm" color={cssVar(system.color.icon.soft)} />
        </InputGroup.InnerStart>
        <InputGroup.Input
          as={TextInput}
          type="search"
          aria-label={searchAriaLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={
            onSearchChange
              ? (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)
              : undefined
          }
        />
      </InputGroup>

      {filters}

      {children != null ? <Flex cs={trailingStyles}>{children}</Flex> : null}
    </Flex>

    {chips && chips.length > 0 ? (
      <Flex cs={chipRowStyles} role="list" aria-label="Active filters">
        {chips.map(chip => (
          <Pill key={chip.id} variant="removable" role="listitem">
            <Pill.Label>{chip.label}</Pill.Label>
            <Pill.IconButton
              aria-label={`Remove ${chip.label}`}
              onClick={() => onRemoveChip?.(chip.id)}
            />
          </Pill>
        ))}
      </Flex>
    ) : null}
  </Flex>
);

export default FilterBar;
