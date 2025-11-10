import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';

const DropdownMenu = Menu;
const DropdownMenuTrigger = Menu.Button;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Menu.Items>,
  React.ComponentPropsWithoutRef<typeof Menu.Items>
>(({ className, ...props }, ref) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <Menu.Items
      ref={ref}
      className={clsx(
        'absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        className
      )}
      {...props}
    />
  </Transition>
));
DropdownMenuContent.displayName = Menu.Items.displayName;

type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <Menu.Item>
      {({ active }) => (
        <button
          ref={ref}
          className={clsx(
            'group flex w-full items-center rounded-md px-2 py-2 text-sm',
            active ? 'bg-primary-500 text-white' : 'text-gray-900',
            className
          )}
          {...props}
        />
      )}
    </Menu.Item>
  )
)
DropdownMenuItem.displayName = 'DropdownMenuItem';


export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
