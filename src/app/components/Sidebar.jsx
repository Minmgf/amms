"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCogs,
  FaTools,
  FaMoneyCheckAlt,
  FaClipboardList,
  FaUsers,
  FaBroadcastTower,
  FaCalendarCheck,
  FaRegNewspaper,
  FaFileInvoice,
  FaClipboardCheck,
  FaUserShield,
  FaHistory,
  FaDesktop,
  FaRssSquare,
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import {
  FiLogOut,
  FiBell,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

// ---- NOTIFICATIONS ----
const initialNotis = [
  {
    id: "n1",
    title: "Maintenance Request Approved",
    body: "Your maintenance request for Tractor CATO0D5GPWGBO1070 has been approved and scheduled.",
    date: "15/01/2024",
    status: "unread",
    type: "success",
  },
  {
    id: "n2",
    title: "New Employee Added",
    body: "Hernán Torres has been successfully added to the payroll system.",
    date: "15/01/2024",
    status: "unread",
    type: "info",
  },
  {
    id: "n3",
    title: "System Maintenance",
    body: "Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM.",
    date: "14/01/2024",
    status: "read",
    type: "warning",
  },
  {
    id: "n4",
    title: "Payroll Generated",
    body: "Monthly payroll for December 2023 has been successfully generated.",
    date: "14/01/2024",
    status: "read",
    type: "success",
  },
  {
    id: "n5",
    title: "Permission Request",
    body: "New permission request from Maria Rodríguez requires your approval.",
    date: "14/01/2024",
    status: "unread",
    type: "info",
  },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname(); // 👈 detecta la ruta actual

  const [showNotis, setShowNotis] = useState(false);
  const [notis, setNotis] = useState(initialNotis);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const unreadCount = notis.filter((n) => n.status === "unread").length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    }
  }, [setIsOpen]);

  useEffect(() => {
    // Abrir automáticamente el menú padre si estás en una ruta hija
    menuItems.forEach((item) => {
      if (item.sub && pathname.startsWith(item.path)) {
        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // ---- Notis: close with click-outside / ESC ----
  useEffect(() => {
    if (!showNotis) return;

    function onKey(e) {
      if (e.key === "Escape") setShowNotis(false);
    }
    function onClick(e) {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      setShowNotis(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showNotis]);

  const markAllAsRead = () =>
    setNotis((prev) => prev.map((n) => ({ ...n, status: "read" })));

  const markOneAsRead = (id) =>
    setNotis((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );

  const iconDot = (type) => {
    const map = {
      success: "bg-green-500",
      warning: "bg-yellow-500",
      info: "bg-purple-500",
    };
    return map[type] || "bg-gray-400";
  };

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/home" },
    { name: "Machinery", icon: <FaCogs />, path: "/machinery" },
    {
      name: "Maintenance",
      icon: <FaTools />,
      path: "/maintenance",
      sub: [
        {
          name: "Schedule Maintenance",
          icon: <FaCalendarCheck />,
          path: "/maintenance/scheduleMaintenance",
        },
        {
          name: "Maintenance Requests",
          icon: <FaRegNewspaper />,
          path: "/maintenance/maintenanceRequest",
        },
      ],
    },
    {
      name: "Payroll",
      icon: <FaMoneyCheckAlt />,
      path: "/payroll",
      sub: [
        { name: "Reports", icon: <FaFileInvoice />, path: "/payroll/reports" },
        {
          name: "Novelty",
          icon: <FaClipboardCheck />,
          path: "/payroll/novelty",
        },
        {
          name: "Payrolls",
          icon: <FaClipboardList />,
          path: "/payroll/payrolls",
        },
      ],
    },
    {
      name: "Requests",
      icon: <FaClipboardList />,
      path: "/requests",
      sub: [
        { name: "Clients", icon: <FaUsers />, path: "/requests/clients" },
        {
          name: "Service Managements",
          icon: <FaTools />,
          path: "/requests/serviceManagement",
        },
      ],
    },
    {
      name: "User Management",
      icon: <FaUsers />,
      path: "/userManagement",
      sub: [
        {
          name: "Role Management",
          icon: <FaUserShield />,
          path: "/userManagement/roleManagement",
        },
        {
          name: "Audit Log",
          icon: <FaHistory />,
          path: "/userManagement/auditLog",
        },
      ],
    },
    {
      name: "Monitoring",
      icon: <FaBroadcastTower />,
      path: "/monitoring",
      sub: [
        {
          name: "Devices Management",
          icon: <FaDesktop />,
          path: "/monitoring/devicesManagement",
        },
        {
          name: "Threshold",
          icon: <FaRssSquare />,
          path: "/monitoring/threshold",
        },
      ],
    },
    {
      name: "Parameterization",
      icon: <MdSettings />,
      path: "/parametrization",
    },
  ];

  return (
    <>
      {!isOpen && (
        <button
          className="p-2 fixed top-2 left-2 z-50 bg-gray-500/50 rounded-lg"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={18} />
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen overflow-y-auto bg-white shadow-md flex flex-col justify-between transform transition-transform duration-300 z-40
         ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
      >
        <div className="flex flex-col relative">
          <button
            className="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 lg:block"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={18} />
          </button>

          <div className="flex items-center justify-between p-4 border-b border-gray-100 mt-8">
            <Link href="/userProfile" legacyBehavior>
              <a
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition 
                                        ${
                                          pathname === "/userProfile"
                                            ? "bg-yellow-200 font-medium text-black"
                                            : "hover:bg-gray-100 text-gray-700"
                                        }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold">
                  JV
                </div>
                <div className="leading-tight">
                  <p className="text-xs text-gray-500">Bienvenido!</p>
                  <p className="text-sm font-semibold">[Nombre Usuario]</p>
                </div>
              </a>
            </Link>
            <button
              type="button"
              onClick={() => setShowNotis((s) => !s)}
              className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
              aria-haspopup="dialog"
              aria-expanded={showNotis}
              aria-controls="notifications-panel"
              aria-label="Open notifications"
            >
              <FiBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex justify-center p-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-yellow-400 text-red-500 text-sm rounded-lg hover:bg-yellow-50 transition">
              <FiLogOut /> Log Out
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="flex flex-col gap-1 px-2">
              {menuItems.map((item) => {
                const isActiveParent =
                  pathname === item.path ||
                  pathname.startsWith(item.path + "/");

                return (
                  <div key={item.name}>
                    {!item.sub ? (
                      <Link
                        href={item.path}
                        className={`flex justify-between items-center w-full p-2 rounded-lg transition 
                                                ${
                                                  isActiveParent
                                                    ? "bg-yellow-200 font-medium text-black"
                                                    : "hover:bg-gray-100 text-gray-700"
                                                }`}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon} {item.name}
                        </span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={item.path}
                          onClick={() => {
                            toggleMenu(item.name);
                          }}
                          className={`flex justify-between items-center w-full p-2 rounded-lg transition 
                                                            ${
                                                              isActiveParent
                                                                ? "bg-yellow-200 font-medium text-black"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                            }`}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon} {item.name}
                          </span>
                          {openMenus[item.name] ? (
                            <FiChevronDown />
                          ) : (
                            <FiChevronRight />
                          )}
                        </Link>

                        {openMenus[item.name] && (
                          <div className="ml-8 flex flex-col gap-1 text-sm text-gray-600">
                            {item.sub.map((sub) => {
                              const isActiveSub = pathname === sub.path;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.path}
                                  className={`p-1 hover:text-black hover:font-medium rounded-lg text-left flex items-center gap-3 
                                                                        ${
                                                                          isActiveSub
                                                                            ? "bg-gray-200 font-medium"
                                                                            : ""
                                                                        }`}
                                >
                                  {sub.icon} {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center gap-2 border-t border-gray-100">
          <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded">
            Logo
          </div>
          <span className="text-yellow-500 font-bold text-lg">SIGMA</span>
        </div>
      </aside>

      {showNotis && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          id="notifications-panel"
        >
          {/* Fondo */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          {/* Panel (top-right) */}
          <div
            ref={panelRef}
            className="absolute right-4 top-4 w-[380px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F9F9F9]">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-black">Notifications</h2>
                <span className="text-sm text-gray-500">
                  {unreadCount} {unreadCount === 1 ? "unread" : "unread"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 cursor-pointer hover:underline"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setShowNotis(false)}
                  className="rounded-md cursor-pointer hover:bg-gray-100"
                  aria-label="Close notifications"
                >
                  <FiX size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            <ul className="max-h-[70vh] overflow-y-auto divide-y">
              {notis.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 ${
                    n.status === "unread" ? "bg-[#FEF7FF]" : ""
                  }`}
                >
                  {n.status === "unread" && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                  )}
                  <div className="flex items-start gap-3">
                    {/* left status icon */}
                    <span
                      className={`mt-1 inline-block h-[32px] w-[32px] rounded-full ${iconDot(
                        n.type
                      )}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-black">{n.title}</p>
                      </div>
                      <p className="text-sm text-gray-600">{n.body}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-400">{n.date}</span>
                        {n.status === "unread" ? (
                          <button
                            onClick={() => markOneAsRead(n.id)}
                            className="text-xs text-blue-600 cursor-pointer hover:underline"
                          >
                            Mark as read
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Read</span>
                        )}
                      </div>
                    </div>
                    {/* unread dot */}
                    {n.status === "unread" && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
