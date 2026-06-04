'use client';

import * as React from 'react';

import {Avatar} from '@workday/canvas-kit-react/avatar';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {BodyText, Subtext} from '@workday/canvas-kit-react/text';
import {PrimaryButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {StatusIndicator} from '@workday/canvas-kit-preview-react/status-indicator';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {
  userPlusIcon,
  editIcon,
  mailIcon,
} from '@workday/canvas-system-icons-web';

import {DataTable, type DataTableColumn} from '@/registry/canvasmith/blocks/data-table';
import {DetailDrawer} from '@/registry/canvasmith/blocks/detail-drawer';
import {PageHeader} from '@/registry/canvasmith/ui/page-header';

/**
 * A directory worker record shown in the master list and detail drawer.
 */
interface Worker {
  id: string;
  name: string;
  title: string;
  team: string;
  location: string;
  email: string;
  manager: string;
  startDate: string;
  employmentType: string;
  status: 'positive' | 'caution' | 'neutral';
  statusLabel: string;
}

const WORKERS: Worker[] = [
  {
    id: 'WK-1001',
    name: 'Amara Okafor',
    title: 'Senior Product Designer',
    team: 'Design',
    location: 'London, UK',
    email: 'amara.okafor@example.com',
    manager: 'Helena Voss',
    startDate: 'Mar 4, 2021',
    employmentType: 'Full-time',
    status: 'positive',
    statusLabel: 'Active',
  },
  {
    id: 'WK-1002',
    name: 'Liam Bennett',
    title: 'Software Engineer II',
    team: 'Engineering',
    location: 'Dublin, IE',
    email: 'liam.bennett@example.com',
    manager: 'Priya Nair',
    startDate: 'Aug 16, 2022',
    employmentType: 'Full-time',
    status: 'caution',
    statusLabel: 'On leave',
  },
  {
    id: 'WK-1003',
    name: 'Priya Nair',
    title: 'Staff Engineer',
    team: 'Engineering',
    location: 'Bengaluru, IN',
    email: 'priya.nair@example.com',
    manager: 'Marcus Reed',
    startDate: 'Jan 9, 2019',
    employmentType: 'Full-time',
    status: 'positive',
    statusLabel: 'Active',
  },
  {
    id: 'WK-1004',
    name: 'Diego Hernández',
    title: 'Account Executive',
    team: 'Sales',
    location: 'Austin, US',
    email: 'diego.hernandez@example.com',
    manager: 'Tara Lindqvist',
    startDate: 'Nov 1, 2023',
    employmentType: 'Full-time',
    status: 'positive',
    statusLabel: 'Active',
  },
  {
    id: 'WK-1005',
    name: 'Mei Tanaka',
    title: 'Financial Analyst',
    team: 'Finance',
    location: 'Tokyo, JP',
    email: 'mei.tanaka@example.com',
    manager: 'Olivia Park',
    startDate: 'Jul 22, 2020',
    employmentType: 'Part-time',
    status: 'neutral',
    statusLabel: 'Contractor',
  },
  {
    id: 'WK-1006',
    name: 'Noah Williams',
    title: 'People Operations Specialist',
    team: 'People Ops',
    location: 'Toronto, CA',
    email: 'noah.williams@example.com',
    manager: 'Helena Voss',
    startDate: 'Feb 14, 2024',
    employmentType: 'Full-time',
    status: 'positive',
    statusLabel: 'Active',
  },
  {
    id: 'WK-1007',
    name: 'Sofia Rossi',
    title: 'Marketing Manager',
    team: 'Marketing',
    location: 'Milan, IT',
    email: 'sofia.rossi@example.com',
    manager: 'Tara Lindqvist',
    startDate: 'Sep 30, 2021',
    employmentType: 'Full-time',
    status: 'positive',
    statusLabel: 'Active',
  },
];

const pageStyles = createStyles({
  padding: system.space.x8,
});

const layout = createStyles({
  gap: system.space.x6,
  alignItems: 'flex-start',
});

const listRegion = createStyles({
  flex: 1,
  minWidth: 0,
  backgroundColor: system.color.bg.default,
  borderRadius: system.shape.x2,
  boxShadow: system.depth[1],
  padding: system.space.x6,
});

const fieldGrid = createStyles({
  display: 'grid',
  gridTemplateColumns: '8rem 1fr',
  rowGap: system.space.x4,
  columnGap: system.space.x4,
  alignItems: 'baseline',
  margin: 0,
});

const identityRow = createStyles({
  alignItems: 'center',
  gap: system.space.x4,
  marginBlockEnd: system.space.x6,
});

const fieldLabel = createStyles({
  color: system.color.fg.muted.default,
});

function DetailField({label, value}: {label: string; value: string}) {
  return (
    <React.Fragment>
      <Subtext as="dt" size="large" cs={fieldLabel}>
        {label}
      </Subtext>
      <BodyText as="dd" size="small" cs={{margin: 0}}>
        {value}
      </BodyText>
    </React.Fragment>
  );
}

const NAME_COLUMN: DataTableColumn<Worker> = {
  key: 'name',
  header: 'Name',
  sortable: true,
  width: '1.6fr',
  render: row => (
    <Flex cs={{alignItems: 'center', gap: system.space.x3}}>
      <Avatar name={row.name} size="small" />
      <Box cs={{minWidth: 0}}>
        <BodyText size="small" cs={{margin: 0, fontWeight: cssVar(system.fontWeight.bold)}}>
          {row.name}
        </BodyText>
        <Subtext size="large" cs={{margin: 0, color: system.color.fg.muted.default}}>
          {row.title}
        </Subtext>
      </Box>
    </Flex>
  ),
};

/**
 * Flagship master-detail screen: a {@link DataTable} directory of workers inside
 * an {@link AppShell}; selecting a row opens a {@link DetailDrawer} with that
 * worker's full record and contextual actions. Default-exported as a route entry
 * (`app/list-detail/page.tsx`).
 */
export default function ListDetailPage() {
  const [selected, setSelected] = React.useState<Worker | null>(null);

  const columns = React.useMemo<DataTableColumn<Worker>[]>(
    () => [
      NAME_COLUMN,
      {key: 'team', header: 'Team', sortable: true, width: '1fr'},
      {
        key: 'location',
        header: 'Location',
        sortable: true,
        width: '1.2fr',
      },
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
    ],
    []
  );

  return (
    <Box cs={pageStyles}>
      <PageHeader
        title="Worker Directory"
        breadcrumbs={[{label: 'Home', href: '#home'}, {label: 'People'}, {label: 'Worker Directory'}]}
        actions={<PrimaryButton icon={userPlusIcon}>Add Worker</PrimaryButton>}
      />

      <Flex cs={layout}>
        <Box cs={listRegion}>
          <DataTable<Worker>
            caption="Workers"
            columns={columns}
            data={WORKERS}
            getRowId={row => row.id}
            searchable
            pageSize={6}
            selectable
            selectedIds={selected ? [selected.id] : []}
            onRowClick={setSelected}
          />
        </Box>

        <DetailDrawer
          open={selected !== null}
          onClose={() => setSelected(null)}
          title={selected?.name ?? ''}
          actions={
            selected ? (
              <>
                <SecondaryButton icon={mailIcon}>Message</SecondaryButton>
                <PrimaryButton icon={editIcon}>Edit</PrimaryButton>
              </>
            ) : undefined
          }
        >
          {selected && (
            <Box>
              <Flex cs={identityRow}>
                <Avatar name={selected.name} size="large" />
                <Box>
                  <BodyText
                    size="medium"
                    cs={{margin: 0, fontWeight: cssVar(system.fontWeight.bold)}}
                  >
                    {selected.name}
                  </BodyText>
                  <Subtext size="large" cs={{margin: 0, color: system.color.fg.muted.default}}>
                    {selected.title} · {selected.team}
                  </Subtext>
                  <Box cs={{marginBlockStart: system.space.x2}}>
                    <StatusIndicator variant={selected.status}>
                      <StatusIndicator.Label>{selected.statusLabel}</StatusIndicator.Label>
                    </StatusIndicator>
                  </Box>
                </Box>
              </Flex>

              <Box as="dl" cs={fieldGrid}>
                <DetailField label="Worker ID" value={selected.id} />
                <DetailField label="Email" value={selected.email} />
                <DetailField label="Location" value={selected.location} />
                <DetailField label="Manager" value={selected.manager} />
                <DetailField label="Team" value={selected.team} />
                <DetailField label="Employment" value={selected.employmentType} />
                <DetailField label="Start date" value={selected.startDate} />
              </Box>
            </Box>
          )}
        </DetailDrawer>
      </Flex>
    </Box>
  );
}
