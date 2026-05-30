'use client';

import * as React from 'react';

import {Tabs, useTabsModel} from '@workday/canvas-kit-react/tabs';
import {Box} from '@workday/canvas-kit-react/layout';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/** A single tab: a stable id, a visible label, and the panel content. */
export interface PageTab {
  /** Stable identifier. Wires the tab to its panel and is the value of `defaultTab`. */
  id: string;
  /** The tab's visible label (also its accessible name). */
  label: React.ReactNode;
  /**
   * Optional plain-text version of `label`, used for the overflow menu and
   * type-ahead. Required for accessibility when `label` is not a plain string.
   */
  textValue?: string;
  /** The content rendered in the tab panel when the tab is active. */
  content: React.ReactNode;
}

export interface PageTabsProps {
  /** The tabs to render, in order. */
  tabs: PageTab[];
  /**
   * The `id` of the tab selected on first render. Falls back to the first tab.
   */
  defaultTab?: string;
  /**
   * Called when the active tab changes, with the newly selected tab's `id`.
   */
  onTabChange?: (id: string) => void;
  /**
   * Accessible name for the overflow menu button shown when tabs do not fit.
   * @default 'More tabs'
   */
  overflowLabel?: string;
}

const listWrapperStyles = createStyles({
  borderBlockEnd: `${system.space.half} solid ${system.color.border.divider}`,
});

const panelWrapperStyles = createStyles({
  paddingBlockStart: system.space.x6,
});

const getId = (item: PageTab) => item.id;
const getTextValue = (item: PageTab) =>
  item.textValue ?? (typeof item.label === 'string' ? item.label : item.id);

/**
 * `PageTabs` renders a content-switching tab layout on top of the Canvas `Tabs`
 * compound. The model handles roving tabindex, `role="tab"`/`role="tabpanel"`,
 * `aria-selected`/`aria-controls`, arrow-key navigation, and overflow: tabs that do
 * not fit collapse into an accessible overflow menu automatically.
 *
 * Tabs are driven by the dynamic `items` API so the overflow menu and type-ahead stay
 * correct; each panel is matched to its tab by `id`, independent of position.
 *
 * ```tsx
 * <PageTabs
 *   defaultTab="overview"
 *   tabs={[
 *     {id: 'overview', label: 'Overview', content: <OverviewPanel />},
 *     {id: 'activity', label: 'Activity', content: <ActivityPanel />},
 *     {id: 'settings', label: 'Settings', content: <SettingsPanel />},
 *   ]}
 *   onTabChange={id => console.log('selected', id)}
 * />
 * ```
 */
export const PageTabs = ({
  tabs,
  defaultTab,
  onTabChange,
  overflowLabel = 'More tabs',
}: PageTabsProps) => {
  const initialTab = defaultTab ?? tabs[0]?.id ?? '';

  const model = useTabsModel({
    items: tabs,
    getId,
    getTextValue,
    initialTab,
    onSelect: data => onTabChange?.(data.id),
  });

  return (
    <Tabs model={model}>
      <Box cs={listWrapperStyles}>
        <Tabs.List
          overflowButton={
            <Tabs.OverflowButton aria-label={overflowLabel}>
              {overflowLabel}
            </Tabs.OverflowButton>
          }
        >
          {(item: PageTab) => <Tabs.Item data-id={item.id}>{item.label}</Tabs.Item>}
        </Tabs.List>
      </Box>

      {/* Overflowed tabs collapse into this menu automatically. */}
      <Tabs.Menu.Popper>
        <Tabs.Menu.Card>
          <Tabs.Menu.List>
            {(item: PageTab) => (
              <Tabs.Menu.Item data-id={item.id}>{item.label}</Tabs.Menu.Item>
            )}
          </Tabs.Menu.List>
        </Tabs.Menu.Card>
      </Tabs.Menu.Popper>

      <Box cs={panelWrapperStyles}>
        <Tabs.Panels>
          {(item: PageTab) => (
            <Tabs.Panel data-id={item.id}>{item.content}</Tabs.Panel>
          )}
        </Tabs.Panels>
      </Box>
    </Tabs>
  );
};
