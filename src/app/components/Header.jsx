"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiBell, FiUser, FiX } from "react-icons/fi";
import { MdPalette } from "react-icons/md";

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
];

export default function Header() {
  const [username, setUsername] = useState("");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showNotis, setShowNotis] = useState(false);
  const [notis, setNotis] = useState(initialNotis);
  const panelRef = useRef(null);
  const unreadCount = notis.filter((n) => n.status === "unread").length;

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUsername(userData.name);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  // Cerrar menú si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar notificaciones con ESC o clic fuera
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

  return (
    <header className="w-full flex items-center justify-end px-6 bg-gray-100 py-4 relative">
      <div className="flex items-center gap-4">
        {/* Botón Tema */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MdPalette className="text-gray-600 dark:text-gray-300" size={20} />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Claro
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Oscuro
              </button>
            </div>
          )}
        </div>

        {/* Notificaciones */}
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

        {/* Panel Notificaciones ⬅️ */}
        {showNotis && (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            id="notifications-panel"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
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
                    className={`p-4 ${n.status === "unread" ? "bg-[#FEF7FF]" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* icon */}
                      <span
                        className={`mt-1 inline-block h-[32px] w-[32px] rounded-full ${iconDot(
                          n.type
                        )}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-black">{n.title}</p>
                        <p className="text-sm text-gray-600">{n.body}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {n.date}
                          </span>
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Usuario */}
        <Link
          href="/userProfile"
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            JV
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Bienvenido!
            <br />
            {username}
          </span>
          <FiUser className="text-gray-600 dark:text-gray-300" />
        </Link>
      </div>
    </header>
  );
}
