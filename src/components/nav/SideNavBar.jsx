"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoReorderThreeSharp,
  IoHomeOutline,
  IoListOutline,
  IoPersonOutline,
  IoBarChartOutline,
} from "react-icons/io5";
import PropTypes from "prop-types";
import { useSidebar } from "@/contexts/SidebarContext";

const DEFAULT_MENU = [
  { name: "Home", link: "/", Icon: IoHomeOutline },
  { name: "Category", link: "/category", Icon: IoListOutline },
  { name: "User", link: "/user", Icon: IoPersonOutline },
  { name: "Report", link: "/report", Icon: IoBarChartOutline },
];

function SideNavBar({ menu = DEFAULT_MENU }) {
  const pathname = usePathname() || "/";
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      aria-label="Main sidebar"
      className={`bg-gray-800 text-gray-100 min-h-screen p-3 fixed top-0 left-0 transition-width duration-200 ease-in-out ${
        collapsed ? "w-16" : "w-48"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold select-none">
            {collapsed ? "A" : "Admin"}
          </div>
        </div>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={toggle}
          className="p-1 rounded hover:bg-gray-700 focus:outline-none "
        >
          <IoReorderThreeSharp className="text-2xl" />
        </button>
      </div>

      <nav className="mt-6" aria-label="Sidebar navigation">
        <ul className="space-y-1" role="menu">
          {menu.map((item) => {
            const active =
              pathname === item.link || pathname.startsWith(item.link + "/");
            const ItemIcon = item.Icon || IoListOutline;

            return (
              <li key={item.link} role="none">
                <Link
                  href={item.link}
                  className={`flex items-center gap-3 rounded px-2 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-200 hover:bg-gray-700 hover:text-white"
                  }`}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  title={item.name}
                >
                  <ItemIcon className="text-lg" aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default SideNavBar;
