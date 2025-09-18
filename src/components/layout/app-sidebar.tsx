'use client';

import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, LineChart, LucideIcon, Settings, Users } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', title: 'Jobs', icon: Briefcase },
  { href: '/candidates', title: 'Candidates', icon: Users },
  { href: '/reports', title: 'Reports', icon: LineChart },
  { href: '/settings', title: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
        open ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6 text-primary"/>
            <span className={cn('transition-opacity', !open && 'opacity-0 w-0')}>RecruitFlow</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
              pathname.startsWith(item.href) && 'bg-muted text-primary',
              !open && 'justify-center'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn('transition-opacity', !open && 'sr-only')}>{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        {/* Can be a user profile section */}
      </div>
    </aside>
  );
}
