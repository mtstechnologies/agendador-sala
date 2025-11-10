import React from 'react';
import { clsx } from 'clsx';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface Tab {
  name: string;
  href: string;
  current?: boolean; // opcional; usamos NavLink/isActive para destacar
}

interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  // Descobrir a aba atual a partir da URL
  const activeHref = React.useMemo(() => {
    const found = tabs.find(t => t.href && location.pathname.startsWith(t.href));
    return found?.href ?? tabs[0]?.href ?? '';
  }, [location.pathname, tabs]);

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          value={activeHref}
          onChange={(e) => navigate(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.href}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={({ isActive }) => clsx(
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                end
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
