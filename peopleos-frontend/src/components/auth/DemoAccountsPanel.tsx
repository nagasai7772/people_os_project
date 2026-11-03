import { ChevronRight } from 'lucide-react';

import { ROLE_LABELS, DEMO_ACCOUNTS, type DemoAccount } from '@/data/demoAccounts';

interface DemoAccountsPanelProps {
  onSelect: (account: DemoAccount) => void;
}

export function DemoAccountsPanel({ onSelect }: DemoAccountsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Demo accounts</p>
      <ul className="mt-3 space-y-1">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              onClick={() => onSelect(account)}
              className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{ROLE_LABELS[account.role]}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {account.email} · {account.password}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
