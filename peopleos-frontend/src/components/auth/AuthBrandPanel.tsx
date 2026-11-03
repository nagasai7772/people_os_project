import { Layers, ShieldCheck, Target, Users } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Users, title: 'One source of truth for your people', body: 'Employee records, roles and reporting lines in one place.' },
  { icon: Target, title: 'Performance that keeps moving', body: 'Reviews, goals and feedback tracked from draft to sign-off.' },
  { icon: ShieldCheck, title: 'Access that matches responsibility', body: 'Every role sees exactly what it needs and nothing more.' },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold tracking-tight">PeopleOS</span>
      </div>

      <div className="max-w-md">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight">
          Run your organization with clarity.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
          The people platform for managing employees, teams and performance without the spreadsheet sprawl.
        </p>
        <ul className="mt-10 space-y-6">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-primary-foreground/75">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} PeopleOS. All rights reserved.</p>
    </div>
  );
}
