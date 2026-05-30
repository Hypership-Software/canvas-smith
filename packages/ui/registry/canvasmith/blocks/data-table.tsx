'use client';

import * as React from 'react';
import {Table} from '@workday/canvas-kit-react/table';
import {Checkbox} from '@workday/canvas-kit-react/checkbox';
import {TextInput, InputGroup} from '@workday/canvas-kit-react/text-input';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {BodyText} from '@workday/canvas-kit-react/text';
import {SystemIcon} from '@workday/canvas-kit-react/icon';
import {AriaLiveRegion, useUniqueId} from '@workday/canvas-kit-react/common';
import {
  Pagination,
  getLastPage,
  getVisibleResultsMin,
  getVisibleResultsMax,
} from '@workday/canvas-kit-react/pagination';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';
import {
  searchIcon,
  sortUpIcon,
  sortDownIcon,
  sortIcon,
  inboxIcon,
} from '@workday/canvas-system-icons-web';

const wrapperStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x4,
});

const toolbarStyles = createStyles({
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x4,
  flexWrap: 'wrap',
});

const searchStyles = createStyles({
  maxWidth: '20rem',
  width: '100%',
});

const headerCellStyles = createStyles({
  backgroundColor: system.color.surface.raised,
});

const sortButtonStyles = createStyles({
  display: 'inline-flex',
  alignItems: 'center',
  gap: system.space.x1,
  border: 'none',
  background: 'transparent',
  padding: system.space.zero,
  margin: system.space.zero,
  cursor: 'pointer',
  color: 'inherit',
  font: 'inherit',
  fontWeight: system.fontWeight.bold,
  width: '100%',
  textAlign: 'start',
  '&:focus-visible': {
    outline: '2px solid transparent',
    borderRadius: system.shape.x1,
    boxShadow: `0 0 0 2px ${cssVar(system.color.border.primary.default)}`,
  },
});

const selectCellStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const emptyStyles = createStyles({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: system.space.x4,
  paddingBlock: system.space.x16,
  paddingInline: system.space.x8,
});

const paginationRowStyles = createStyles({
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: system.space.x4,
  flexWrap: 'wrap',
});

type SortDirection = 'asc' | 'desc';

/** Column descriptor for {@link DataTable}. `T` is the row record type. */
export interface DataTableColumn<T> {
  /** Key into the row record; also the React key / sort identifier. */
  key: keyof T & string;
  /** Visible column heading. */
  header: React.ReactNode;
  /** Custom cell renderer; defaults to `String(row[key])`. */
  render?: (row: T) => React.ReactNode;
  /** Enables client-side sorting on this column. */
  sortable?: boolean;
  /** Track width for this column (any CSS grid track value). Defaults to `1fr`. */
  width?: string;
  /** Horizontal alignment of cell content. Defaults to `start`. */
  align?: 'start' | 'center' | 'end';
}

export interface DataTableProps<T> {
  /** Column definitions, in display order. */
  columns: DataTableColumn<T>[];
  /** The full dataset. Sorting, searching and paging are applied client-side. */
  data: T[];
  /** Stable row id accessor (used for keys + selection). Defaults to the `id` field. */
  getRowId?: (row: T) => string;
  /** Accessible caption / heading text for the table. */
  caption: string;
  /** Render a search input that filters across all columns. Defaults to `false`. */
  searchable?: boolean;
  /** Rows per page. Defaults to `10`. */
  pageSize?: number;
  /** Render leading checkboxes for row selection. Defaults to `false`. */
  selectable?: boolean;
  /** Controlled set of selected row ids. */
  selectedIds?: string[];
  /** Fires with the next selected-id set when selection changes. */
  onSelectionChange?: (ids: string[]) => void;
  /** Fires when a row body is activated (click). */
  onRowClick?: (row: T) => void;
  /** Message shown when there are no rows to display. Defaults to "No results found". */
  emptyMessage?: string;
}

function defaultGetRowId<T>(row: T): string {
  return String((row as {id?: unknown}).id ?? '');
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'});
}

/**
 * DataTable — a generic, fully client-side Canvas table with search,
 * sortable columns, optional row selection, and pagination.
 *
 * Built on the CSS-Grid `Table` compound; column tracks are derived from the
 * `columns` definition. Sorting, filtering and paging never mutate `data`.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId = defaultGetRowId,
  caption,
  searchable = false,
  pageSize = 10,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRowClick,
  emptyMessage = 'No results found',
}: DataTableProps<T>) {
  const captionId = useUniqueId();
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>('asc');
  const [page, setPage] = React.useState(1);

  // Uncontrolled selection fallback.
  const [internalSelected, setInternalSelected] = React.useState<string[]>([]);
  const selected = selectedIds ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const setSelection = React.useCallback(
    (ids: string[]) => {
      if (selectedIds === undefined) setInternalSelected(ids);
      onSelectionChange?.(ids);
    },
    [selectedIds, onSelectionChange]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(row =>
      columns.some(col => {
        const value = row[col.key];
        return value != null && String(value).toLowerCase().includes(q);
      })
    );
  }, [data, columns, search]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const result = compareValues(
        (a as Record<string, unknown>)[sortKey],
        (b as Record<string, unknown>)[sortKey]
      );
      return sortDir === 'asc' ? result : -result;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalCount = sorted.length;
  const lastPage = Math.max(1, getLastPage(pageSize, totalCount));

  // Keep the current page within bounds when the dataset shrinks.
  React.useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  const currentPage = Math.min(page, lastPage);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const visibleIds = pageRows.map(getRowId);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every(id => selectedSet.has(id));
  const someVisibleSelected = visibleIds.some(id => selectedSet.has(id));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelection(selected.filter(id => !visibleIds.includes(id)));
    } else {
      setSelection(Array.from(new Set([...selected, ...visibleIds])));
    }
  };

  const toggleRow = (id: string) => {
    if (selectedSet.has(id)) {
      setSelection(selected.filter(existing => existing !== id));
    } else {
      setSelection([...selected, id]);
    }
  };

  const gridTemplateColumns = [
    selectable ? 'auto' : null,
    ...columns.map(col => col.width ?? '1fr'),
  ]
    .filter(Boolean)
    .join(' ');

  const colSpan = columns.length + (selectable ? 1 : 0);

  return (
    <Box cs={wrapperStyles}>
      {searchable ? (
        <Flex cs={toolbarStyles}>
          <Box cs={searchStyles}>
            <InputGroup>
              <InputGroup.InnerStart pointerEvents="none">
                <SystemIcon icon={searchIcon} size="sm" color={system.color.icon.soft} />
              </InputGroup.InnerStart>
              <InputGroup.Input
                as={TextInput}
                type="search"
                value={search}
                placeholder="Search"
                aria-label={`Search ${caption}`}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>
          </Box>
          <AriaLiveRegion>
            <BodyText size="small" cs={{color: system.color.fg.muted.default, margin: 0}}>
              {`${totalCount} ${totalCount === 1 ? 'result' : 'results'}`}
            </BodyText>
          </AriaLiveRegion>
        </Flex>
      ) : null}

      <Table aria-labelledby={captionId} cs={{gridTemplateColumns}}>
        <Table.Caption id={captionId}>{caption}</Table.Caption>
        <Table.Head>
          <Table.Row>
            {selectable ? (
              <Table.Header scope="col" cs={[headerCellStyles, selectCellStyles]}>
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={!allVisibleSelected && someVisibleSelected}
                  aria-label="Select all rows on this page"
                  onChange={toggleAllVisible}
                />
              </Table.Header>
            ) : null}
            {columns.map(col => {
              const isSorted = sortKey === col.key;
              const glyph = !isSorted
                ? sortIcon
                : sortDir === 'asc'
                ? sortUpIcon
                : sortDownIcon;
              return (
                <Table.Header
                  key={col.key}
                  scope="col"
                  cs={[headerCellStyles, {textAlign: col.align ?? 'start'}]}
                  aria-sort={
                    isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={sortButtonStyles}
                      onClick={() => handleSort(col.key)}
                    >
                      <span>{col.header}</span>
                      <SystemIcon
                        icon={glyph}
                        size="xs"
                        color={
                          isSorted
                            ? system.color.icon.primary.default
                            : system.color.icon.soft
                        }
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </Table.Header>
              );
            })}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {pageRows.length === 0 ? (
            <Table.Row>
              <Table.Cell cs={{gridColumn: `1 / span ${colSpan}`}}>
                <Flex cs={emptyStyles}>
                  <SystemIcon icon={inboxIcon} size="xl" color={system.color.icon.disabled} />
                  <BodyText size="medium" cs={{color: system.color.fg.muted.default, margin: 0}}>
                    {emptyMessage}
                  </BodyText>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ) : (
            pageRows.map(row => {
              const id = getRowId(row);
              const isSelected = selectedSet.has(id);
              return (
                <Table.Row
                  key={id}
                  cs={
                    onRowClick
                      ? {
                          cursor: 'pointer',
                          '&:hover': {backgroundColor: system.color.bg.alt.soft},
                        }
                      : undefined
                  }
                >
                  {selectable ? (
                    <Table.Cell cs={selectCellStyles}>
                      <Checkbox
                        checked={isSelected}
                        aria-label={`Select row ${id}`}
                        onChange={() => toggleRow(id)}
                      />
                    </Table.Cell>
                  ) : null}
                  {columns.map(col => (
                    <Table.Cell
                      key={col.key}
                      cs={{textAlign: col.align ?? 'start'}}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table>

      {totalCount > pageSize ? (
        <Flex cs={paginationRowStyles}>
          <Pagination
            aria-label={`${caption} pagination`}
            lastPage={lastPage}
            initialCurrentPage={currentPage}
            onPageChange={n => setPage(n)}
          >
            <Pagination.Controls>
              <Pagination.JumpToFirstButton aria-label="First page" />
              <Pagination.StepToPreviousButton aria-label="Previous page" />
              <Pagination.PageList>
                {({state}) =>
                  state.range.map(pageNumber => (
                    <Pagination.PageListItem key={pageNumber}>
                      <Pagination.PageButton
                        aria-label={`Page ${pageNumber}`}
                        pageNumber={pageNumber}
                      />
                    </Pagination.PageListItem>
                  ))
                }
              </Pagination.PageList>
              <Pagination.StepToNextButton aria-label="Next page" />
              <Pagination.JumpToLastButton aria-label="Last page" />
            </Pagination.Controls>
            <Pagination.AdditionalDetails>
              {({state}) =>
                `${getVisibleResultsMin(state.currentPage, pageSize)}–${getVisibleResultsMax(
                  state.currentPage,
                  pageSize,
                  totalCount
                )} of ${totalCount}`
              }
            </Pagination.AdditionalDetails>
          </Pagination>
        </Flex>
      ) : null}
    </Box>
  );
}

export default DataTable;
