import * as React from 'react'

import styles from './mocks.module.css'

/**
 * Canvas-native product mocks — plain markup styled with `--cm-*` tokens to read
 * like real Workday Canvas screens. These are decorative stand-ins (NOT Canvas
 * Kit / Emotion), so they stay SSR-safe and keep the marketing layer dependency
 * free. Shared by the hero rotating showcase and the registry preview modal.
 */

export function TimeOffMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <span className={styles.avatar}>AR</span>
        <div className={styles.headText}>
          <span className={styles.title}>Request time off</span>
          <span className={styles.crumb}>Absence · Worker</span>
        </div>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Type</span>
        <span className={styles.select}>
          Vacation
          <span className={styles.caret} />
        </span>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <span className={styles.label}>From</span>
          <span className={styles.input}>Jun 8, 2026</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>To</span>
          <span className={styles.input}>Jun 12, 2026</span>
        </div>
      </div>
      <div className={styles.callout}>
        <span className={styles.calloutLabel}>Available balance</span>
        <span className={styles.calloutValue}>14.0 days</span>
      </div>
      <div className={styles.actions}>
        <span className={styles.btnGhost}>Cancel</span>
        <span className={styles.btnPrimary}>Submit request</span>
      </div>
    </div>
  )
}

export function StatDashboardMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <span className={styles.title}>People overview</span>
          <span className={styles.crumb}>Workforce · Q2 FY26</span>
        </div>
        <span className={styles.headSpacer} />
        <span className={styles.pill + ' ' + styles.pillBlue}>This quarter</span>
      </div>
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Headcount</span>
          <span className={styles.statValue}>4,820</span>
          <span className={styles.statTrend + ' ' + styles.trendUp}>▲ 3.2%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Attrition</span>
          <span className={styles.statValue}>6.1%</span>
          <span className={styles.statTrend + ' ' + styles.trendDown}>▼ 0.8%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Open reqs</span>
          <span className={styles.statValue}>137</span>
          <span className={styles.statTrend + ' ' + styles.trendUp}>▲ 12</span>
        </div>
      </div>
      <WorkerRows rows={2} />
    </div>
  )
}

const WORKERS = [
  { i: 'JM', n: 'Jordan Mills', d: 'Engineering', s: 'Active', dot: styles.dotG, pill: styles.pillGreen },
  { i: 'PA', n: 'Priya Anand', d: 'Finance', s: 'On leave', dot: styles.dotA, pill: styles.pillAmber },
  { i: 'L**', n: 'Liam Becker', d: 'Sales', s: 'Active', dot: styles.dotG, pill: styles.pillGreen },
  { i: 'SO', n: 'Sofia Ortiz', d: 'People', s: 'Pending', dot: styles.dotB, pill: styles.pillBlue },
  { i: 'KT', n: 'Kenji Tanaka', d: 'Product', s: 'Active', dot: styles.dotG, pill: styles.pillGreen },
] as const

function WorkerRows({ rows }: { rows: number }) {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>Worker</span>
        <span>Department</span>
        <span>Status</span>
      </div>
      {WORKERS.slice(0, rows).map((w) => (
        <div className={styles.tableRow} key={w.n}>
          <span className={styles.cellName}>
            <span className={styles.cellAvatar}>{w.i.replace('**', 'B')}</span>
            {w.n}
          </span>
          <span>{w.d}</span>
          <span className={`${styles.pill} ${w.pill}`}>
            <span className={w.dot} />
            {w.s}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DataTableMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <span className={styles.title}>Workers</span>
          <span className={styles.crumb}>4,820 records</span>
        </div>
        <span className={styles.headSpacer} />
        <span className={`${styles.btnPrimary} ${styles.btnSm}`}>Add worker</span>
      </div>
      <div className={styles.filterBar}>
        <span className={styles.search}>🔍 Search workers…</span>
        <span className={styles.segment}>
          <span className={styles.segItem} data-active="true">All</span>
          <span className={styles.segItem}>Active</span>
          <span className={styles.segItem}>Leave</span>
        </span>
      </div>
      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <span>Worker</span>
          <span>Department</span>
          <span>Status</span>
        </div>
        {WORKERS.slice(0, 4).map((w) => (
          <div className={styles.tableRow} key={w.n}>
            <span className={styles.cellName}>
              <span className={styles.cellAvatar}>{w.i.replace('**', 'B')}</span>
              {w.n}
            </span>
            <span>{w.d}</span>
            <span className={`${styles.pill} ${w.pill}`}>
              <span className={w.dot} />
              {w.s}
            </span>
          </div>
        ))}
        <div className={styles.tableFoot}>
          <span>1–4 of 4,820</span>
          <span className={styles.pager}>
            <span className={styles.pagerBtn}>‹</span>
            <span className={styles.pagerBtn} data-active="true">1</span>
            <span className={styles.pagerBtn}>2</span>
            <span className={styles.pagerBtn}>›</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function StatCardMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Headcount</span>
          <span className={styles.statValue}>4,820</span>
          <span className={styles.statTrend + ' ' + styles.trendUp}>▲ 3.2% vs Q1</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Attrition</span>
          <span className={styles.statValue}>6.1%</span>
          <span className={styles.statTrend + ' ' + styles.trendDown}>▼ 0.8% vs Q1</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Offer accept</span>
          <span className={styles.statValue}>92%</span>
          <span className={styles.statTrend + ' ' + styles.trendUp}>▲ 4 pts</span>
        </div>
      </div>
    </div>
  )
}

export function SettingsFormMock() {
  const items = [
    { t: 'Email notifications', s: 'Send a digest every morning', on: true },
    { t: 'Two-factor auth', s: 'Require a code at sign-in', on: true },
    { t: 'Auto-approve PTO', s: 'Under 2 days, same team', on: false },
  ]
  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <span className={styles.title}>Preferences</span>
          <span className={styles.crumb}>Account · Settings</span>
        </div>
      </div>
      <div>
        {items.map((it) => (
          <div className={styles.toggleRow} key={it.t}>
            <span className={styles.toggleText}>
              <span className={styles.toggleTitle}>{it.t}</span>
              <span className={styles.toggleSub}>{it.s}</span>
            </span>
            <span className={styles.switch} data-on={String(it.on)} />
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <span className={styles.btnGhost}>Discard</span>
        <span className={styles.btnPrimary}>Save changes</span>
      </div>
    </div>
  )
}

export function PageHeaderMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.crumbs}>
        People <span className={styles.crumbSep}>/</span> Workers{' '}
        <span className={styles.crumbSep}>/</span> Jordan Mills
      </div>
      <div className={styles.head} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className={styles.headText}>
          <span className={styles.pageTitle}>Jordan Mills</span>
          <span className={styles.crumb}>Senior Engineer · San Francisco</span>
        </div>
        <span className={styles.headSpacer} />
        <span className={styles.headerActions}>
          <span className={`${styles.btnGhost} ${styles.btnSm}`}>Message</span>
          <span className={`${styles.btnPrimary} ${styles.btnSm}`}>Edit profile</span>
        </span>
      </div>
      <div className={styles.tabs}>
        <span className={styles.tab} data-active="true">Overview</span>
        <span className={styles.tab}>Compensation</span>
        <span className={styles.tab}>Time off</span>
        <span className={styles.tab}>Documents</span>
      </div>
      <WorkerRows rows={2} />
    </div>
  )
}

export function PageTabsMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.tabs}>
        <span className={styles.tab} data-active="true">Overview</span>
        <span className={styles.tab}>Team</span>
        <span className={styles.tab}>Compensation</span>
        <span className={styles.tab}>History</span>
      </div>
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tenure</span>
          <span className={styles.statValue}>3.4y</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Team</span>
          <span className={styles.statValue}>12</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Rating</span>
          <span className={styles.statValue}>Exceeds</span>
        </div>
      </div>
      <WorkerRows rows={2} />
    </div>
  )
}

export function EmptyStateMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M3 9h18M8 14h5" />
          </svg>
        </span>
        <span className={styles.emptyTitle}>No expense reports yet</span>
        <span className={styles.emptyBody}>
          Submit your first report and it’ll show up here for approval.
        </span>
        <span className={styles.btnPrimary} style={{ marginTop: '0.25rem' }}>
          New report
        </span>
      </div>
    </div>
  )
}

export function ConfirmDialogMock() {
  return (
    <div className={styles.dialogStage}>
      <div className={styles.dialog}>
        <span className={styles.dialogTitle}>Delete worker record?</span>
        <span className={styles.dialogBody}>
          This permanently removes Jordan Mills and all associated history. This
          can’t be undone.
        </span>
        <div className={styles.actions} style={{ marginTop: '0.25rem' }}>
          <span className={styles.btnGhost}>Cancel</span>
          <span className={styles.btnDelete}>Delete</span>
        </div>
      </div>
    </div>
  )
}

export function ToastCenterMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.toastStack}>
        <span className={`${styles.toast} ${styles.toastSuccess}`}>
          <ToastDot kind="ok" /> Time-off request submitted
        </span>
        <span className={`${styles.toast} ${styles.toastInfo}`}>
          <ToastDot kind="info" /> Sync with Workday completed
        </span>
        <span className={`${styles.toast} ${styles.toastWarn}`}>
          <ToastDot kind="warn" /> 2 approvals awaiting your review
        </span>
      </div>
    </div>
  )
}

function ToastDot({ kind }: { kind: 'ok' | 'info' | 'warn' }) {
  const glyph = kind === 'ok' ? '✓' : kind === 'warn' ? '!' : 'i'
  return (
    <span className={styles.toastIcon} aria-hidden="true">
      {glyph}
    </span>
  )
}

export function UserMenuMock() {
  return (
    <div className={styles.menuWrap}>
      <div className={styles.menu}>
        <div className={styles.menuHead}>
          <span className={styles.avatar} style={{ width: '2rem', height: '2rem' }}>
            AR
          </span>
          <span className={styles.headText}>
            <span className={styles.menuName}>Avery Rao</span>
            <span className={styles.menuMail}>avery@workday.example</span>
          </span>
        </div>
        <div className={styles.menuItem}>View profile</div>
        <div className={styles.menuItem}>Preferences</div>
        <div className={styles.menuItem}>Switch tenant</div>
        <div className={styles.menuItem} data-danger="true">Sign out</div>
      </div>
    </div>
  )
}

export function FilterBarMock() {
  return (
    <div className={styles.screen}>
      <div className={styles.filterBar}>
        <span className={styles.search}>🔍 Search workers…</span>
        <span className={styles.segment}>
          <span className={styles.segItem} data-active="true">All</span>
          <span className={styles.segItem}>Active</span>
          <span className={styles.segItem}>Leave</span>
        </span>
      </div>
      <div className={styles.chips}>
        <span className={styles.chip}>Department: Eng ✕</span>
        <span className={styles.chip}>Location: SF ✕</span>
        <span className={styles.chip}>Status: Active ✕</span>
      </div>
      <WorkerRows rows={3} />
    </div>
  )
}

export function AppShellMock() {
  return (
    <div className={styles.screen} style={{ padding: '1rem' }}>
      <div className={styles.shell}>
        <nav className={styles.shellNav}>
          <span className={styles.shellBrand}>
            <span className={styles.shellDot} /> Acme HR
          </span>
          <span className={styles.shellLink} data-active="true">Home</span>
          <span className={styles.shellLink}>Workers</span>
          <span className={styles.shellLink}>Time off</span>
          <span className={styles.shellLink}>Payroll</span>
          <span className={styles.shellLink}>Reports</span>
        </nav>
        <div className={styles.shellMain}>
          <div className={styles.crumbs}>People / Workers</div>
          <div className={styles.statGrid} style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Headcount</span>
              <span className={styles.statValue}>4,820</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Open reqs</span>
              <span className={styles.statValue}>137</span>
            </div>
          </div>
          <WorkerRows rows={2} />
        </div>
      </div>
    </div>
  )
}

export function DetailDrawerMock() {
  return (
    <div className={styles.screen} style={{ padding: '1rem' }}>
      <div className={styles.drawerWrap}>
        <div className={styles.drawerList}>
          <div className={styles.drawerItem} data-active="true">
            <span className={styles.cellAvatar}>JM</span> Jordan Mills
          </div>
          <div className={styles.drawerItem}>
            <span className={styles.cellAvatar}>PA</span> Priya Anand
          </div>
          <div className={styles.drawerItem}>
            <span className={styles.cellAvatar}>LB</span> Liam Becker
          </div>
          <div className={styles.drawerItem}>
            <span className={styles.cellAvatar}>SO</span> Sofia Ortiz
          </div>
        </div>
        <div className={styles.drawerPanel}>
          <span className={styles.drawerLabel}>Worker</span>
          <span className={styles.drawerValue}>Jordan Mills</span>
          <span className={styles.drawerLabel}>Department</span>
          <span className={styles.drawerValue}>Engineering</span>
          <span className={styles.drawerLabel}>Manager</span>
          <span className={styles.drawerValue}>Avery Rao</span>
          <span className={`${styles.pill} ${styles.pillGreen}`} style={{ marginTop: '0.25rem' }}>
            <span className={styles.dotG} /> Active
          </span>
        </div>
      </div>
    </div>
  )
}

/** Block name → preview component. Keys match the registry `name` fields. */
export const BLOCK_PREVIEWS: Record<string, React.FC> = {
  'stat-card': StatCardMock,
  'empty-state': EmptyStateMock,
  'page-header': PageHeaderMock,
  'settings-form': SettingsFormMock,
  'filter-bar': FilterBarMock,
  'confirm-dialog': ConfirmDialogMock,
  'toast-center': ToastCenterMock,
  'page-tabs': PageTabsMock,
  'user-menu': UserMenuMock,
  'app-shell': AppShellMock,
  'data-table': DataTableMock,
  'detail-drawer': DetailDrawerMock,
  dashboard: StatDashboardMock,
  'list-detail': DetailDrawerMock,
}
