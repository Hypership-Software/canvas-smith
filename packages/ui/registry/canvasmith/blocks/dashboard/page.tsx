'use client';

import * as React from 'react';

import {Box, Grid} from '@workday/canvas-kit-react/layout';
import {PrimaryButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {StatusIndicator} from '@workday/canvas-kit-preview-react/status-indicator';
import {createStyles} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {
  usersIcon,
  exportIcon,
  plusIcon,
  userIcon,
  clipboardListIcon,
  calendarIcon,
} from '@workday/canvas-system-icons-web';

import {DataTable, type DataTableColumn} from '@/registry/canvasmith/blocks/data-table';
import {PageHeader} from '@/registry/canvasmith/ui/page-header';
import {StatCard} from '@/registry/canvasmith/ui/stat-card';

/**
 * A recent worker-lifecycle activity row surfaced on the dashboard table.
 */
interface ActivityRow {
  id: string;
  worker: string;
  action: string;
  team: string;
  date: string;
  status: 'positive' | 'caution' | 'critical' | 'info' | 'neutral';
  statusLabel: string;
}

const ACTIVITY: ActivityRow[] = [
  {
    id: 'WD-4821',
    worker: 'Amara Okafor',
    action: 'Hire — Senior Product Designer',
    team: 'Design',
    date: 'May 28, 2026',
    status: 'positive',
    statusLabel: 'Completed',
  },
  {
    id: 'WD-4820',
    worker: 'Liam Bennett',
    action: 'Time Off — Vacation (5 days)',
    team: 'Engineering',
    date: 'May 27, 2026',
    status: 'caution',
    statusLabel: 'Pending approval',
  },
  {
    id: 'WD-4817',
    worker: 'Priya Nair',
    action: 'Promotion — Staff Engineer',
    team: 'Engineering',
    date: 'May 27, 2026',
    status: 'info',
    statusLabel: 'In review',
  },
  {
    id: 'WD-4814',
    worker: 'Diego Hernández',
    action: 'Job Requisition — Account Executive',
    team: 'Sales',
    date: 'May 26, 2026',
    status: 'info',
    statusLabel: 'Open',
  },
  {
    id: 'WD-4809',
    worker: 'Mei Tanaka',
    action: 'Compensation Change — Merit Increase',
    team: 'Finance',
    date: 'May 25, 2026',
    status: 'positive',
    statusLabel: 'Approved',
  },
  {
    id: 'WD-4802',
    worker: 'Noah Williams',
    action: 'Onboarding — IT Equipment Setup',
    team: 'People Ops',
    date: 'May 24, 2026',
    status: 'critical',
    statusLabel: 'Overdue',
  },
  {
    id: 'WD-4798',
    worker: 'Sofia Rossi',
    action: 'Time Off — Sick Leave (1 day)',
    team: 'Marketing',
    date: 'May 23, 2026',
    status: 'neutral',
    statusLabel: 'Recorded',
  },
];

const statGrid = createStyles({
  gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
  gap: system.space.x6,
  marginBlockEnd: system.space.x8,
});

const tableSection = createStyles({
  backgroundColor: system.color.bg.default,
  borderRadius: system.shape.x2,
  boxShadow: system.depth[1],
  padding: system.space.x6,
});

const pageStyles = createStyles({
  padding: system.space.x8,
});

const COLUMNS: DataTableColumn<ActivityRow>[] = [
  {key: 'id', header: 'Request', sortable: true, width: '0.8fr'},
  {key: 'worker', header: 'Worker', sortable: true, width: '1.4fr'},
  {key: 'action', header: 'Activity', sortable: true, width: '2fr'},
  {key: 'team', header: 'Team', sortable: true, width: '1fr'},
  {key: 'date', header: 'Date', sortable: true, width: '1fr'},
  {
    key: 'status',
    header: 'Status',
    sortable: false,
    width: '1fr',
    render: row => (
      <StatusIndicator variant={row.status}>
        <StatusIndicator.Label>{row.statusLabel}</StatusIndicator.Label>
      </StatusIndicator>
    ),
  },
];

/**
 * Flagship Workday-style operations dashboard: a {@link PageHeader}, a
 * responsive grid of headline {@link StatCard}s, and a {@link DataTable} of
 * recent worker-lifecycle activity. Designed to be rendered inside the root
 * layout's {@link AppShell} chrome. Default-exported as a route entry
 * (`app/dashboard/page.tsx`).
 */
export default function DashboardPage() {
  return (
    <Box cs={pageStyles}>
      <PageHeader
        title="Workforce Overview"
        breadcrumbs={[
          {label: 'Home', href: '#home'},
          {label: 'Analytics', href: '#analytics'},
          {label: 'Workforce Overview'},
        ]}
        actions={
          <>
            <SecondaryButton icon={exportIcon}>Export</SecondaryButton>
            <PrimaryButton icon={plusIcon}>New Request</PrimaryButton>
          </>
        }
      />

      <Grid cs={statGrid}>
        <StatCard
          label="Headcount"
          value="3,482"
          icon={usersIcon}
          trend="+4.1%"
          trendDirection="up"
          trendLabel="vs. last quarter"
        />
        <StatCard
          label="Open Requisitions"
          value="126"
          icon={clipboardListIcon}
          trend="+18"
          trendDirection="up"
          trendLabel="42 in final round"
        />
        <StatCard
          label="Time-off Pending"
          value="37"
          icon={calendarIcon}
          trend="-9"
          trendDirection="down"
          trendLabel="awaiting manager approval"
        />
        <StatCard
          label="Avg. Tenure"
          value="4.2 yrs"
          icon={userIcon}
          trend="+0.3 yr"
          trendDirection="up"
          trendLabel="company-wide"
        />
      </Grid>

      <Box cs={tableSection}>
        <DataTable<ActivityRow>
          caption="Recent activity"
          columns={COLUMNS}
          data={ACTIVITY}
          getRowId={row => row.id}
          searchable
          pageSize={5}
        />
      </Box>
    </Box>
  );
}
