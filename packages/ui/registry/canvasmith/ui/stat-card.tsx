'use client';

import * as React from 'react';
import {Card} from '@workday/canvas-kit-react/card';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {Text} from '@workday/canvas-kit-react/text';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {AccessibleHide, useUniqueId} from '@workday/canvas-kit-react/common';
import {
  arrowUpIcon,
  arrowDownIcon,
  minusIcon,
  type CanvasSystemIcon,
} from '@workday/canvas-system-icons-web';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

/**
 * Direction of the trend delta. Drives the trend row icon + semantic color.
 * - `up` → positive (green) up arrow
 * - `down` → critical (red) down arrow
 * - `flat` → muted neutral dash
 */
export type StatCardTrendDirection = 'up' | 'down' | 'flat';

export interface StatCardProps {
  /** Short, human-readable metric name (e.g. "Active users"). */
  label: string;
  /** The headline metric value. Pre-format numbers/currency before passing. */
  value: React.ReactNode;
  /** Optional trend delta text shown next to the direction arrow (e.g. "+12.5%"). */
  trend?: React.ReactNode;
  /**
   * Semantic direction of the trend. Defaults to `flat`.
   * Determines the arrow glyph and color (green up / red down / muted flat).
   */
  trendDirection?: StatCardTrendDirection;
  /** Optional leading metric icon rendered in the card header. */
  icon?: CanvasSystemIcon;
  /**
   * Accessible context appended to the trend for screen readers
   * (e.g. "vs. last month"). Rendered visually as muted helper text when provided.
   */
  trendLabel?: React.ReactNode;
  /** Additional class names / `cs` styling passed through to the Card. */
  className?: string;
}

const cardStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x2,
  padding: system.space.x6,
  borderRadius: system.shape.x2,
  boxShadow: system.depth[1],
  backgroundColor: system.color.surface.default,
  minInlineSize: 0,
});

const headerStyles = createStyles({
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x2,
});

const labelStyles = createStyles({
  color: cssVar(system.color.fg.muted.default),
  fontWeight: cssVar(system.fontWeight.medium),
});

const valueStyles = createStyles({
  color: cssVar(system.color.fg.stronger),
  margin: 0,
});

const trendRowStyles = createStyles({
  alignItems: 'center',
  gap: system.space.x1,
});

const trendLabelStyles = createStyles({
  color: cssVar(system.color.fg.muted.default),
});

const TREND_CONFIG: Record<
  StatCardTrendDirection,
  {icon: CanvasSystemIcon; color: string; word: string}
> = {
  up: {icon: arrowUpIcon, color: system.color.fg.positive.default, word: 'Trending up'},
  down: {icon: arrowDownIcon, color: system.color.fg.critical.default, word: 'Trending down'},
  flat: {icon: minusIcon, color: system.color.fg.muted.default, word: 'No change'},
};

/**
 * A compact KPI card: a labeled metric with an optional leading icon and a
 * colored, directional trend row. Built on Canvas `Card` with `system.type`
 * for the value/label and semantic `fg.positive` / `fg.critical` color tokens
 * so the trend meaning is conveyed by icon + color + text (never color alone).
 */
export const StatCard = ({
  label,
  value,
  trend,
  trendDirection = 'flat',
  icon,
  trendLabel,
  className,
}: StatCardProps) => {
  const labelId = useUniqueId();
  const valueId = useUniqueId();
  const direction = TREND_CONFIG[trendDirection];

  return (
    <Card cs={cardStyles} className={className} aria-labelledby={labelId} aria-describedby={valueId}>
      <Flex cs={headerStyles}>
        <Text id={labelId} typeLevel="subtext.large" cs={labelStyles}>
          {label}
        </Text>
        {icon ? <SystemIcon icon={icon} size="md" color={cssVar(system.color.icon.soft)} /> : null}
      </Flex>

      <Text id={valueId} as="p" typeLevel="title.small" cs={valueStyles}>
        {value}
      </Text>

      {trend != null ? (
        <Flex cs={trendRowStyles}>
          <SystemIcon icon={direction.icon} size="xs" color={cssVar(direction.color)} />
          <AccessibleHide>{`${direction.word}: `}</AccessibleHide>
          <Text typeLevel="subtext.large" cs={{color: cssVar(direction.color), fontWeight: cssVar(system.fontWeight.medium)}}>
            {trend}
          </Text>
          {trendLabel != null ? (
            <Text typeLevel="subtext.large" cs={trendLabelStyles}>
              {trendLabel}
            </Text>
          ) : null}
        </Flex>
      ) : null}
    </Card>
  );
};

export default StatCard;
