"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiBell, FiUser, FiX } from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import { getUserData } from "@/services/profileService";
import { getNotifications, markAllNotAsRead, markOneNotAsRead } from "@/services/notificationService";
import { SuccessModal, ErrorModal } from "./shared/SuccessErrorModal";

export default function Header() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showNotis, setShowNotis] = useState(false);
  const [notis, setNotis] = useState([]);
  const panelRef = useRef(null);
  const unreadCount = notis.filter((n) => n.status === "unread").length;
  const [message, setMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUsername(userData.name);
        setUserId(userData.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);


  useEffect(() => {
    if (!userId) return;

    async function fetchUserPhoto() {
      try {
        const response = await getUserData(userId);
        const data = response.data[0];
        console.log("esta es la foto del header", data.profile_picture);
        if (data.profile_picture) {
          setProfilePhoto(data.profile_picture);
        }
      } catch (err) {
        console.error("Error fetching user photo:", err);
      }
    }

    fetchUserPhoto();
  }, [userId]);

  useEffect(() => {
    const photo = localStorage.getItem("userPhoto");
    if (photo) setProfilePhoto(photo);

    function handlePhotoChange() {
      const photo = localStorage.getItem("userPhoto");
      if (photo) setProfilePhoto(photo);
    }

    window.addEventListener("userPhotoChanged", handlePhotoChange);
    return () => window.removeEventListener("userPhotoChanged", handlePhotoChange);
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await getNotifications();
        if (response.success && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            setMessage("No notifications available.");
            setNotis([]);
          } else {
            const mapped = response.data.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.message,
              date: new Date(n.created_at).toLocaleDateString("es-CO"),
              status: n.read ? "read" : "unread",
              type: n.type,
            }));
            setNotis(mapped);
            setMessage("");
          }
        } else {
          setMessage("Unable to fetch notifications.");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setMessage("Unable to fetch notifications.");
      }
    }

    fetchNotifications();
  }, []);

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

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await markAllNotAsRead();
      if (response.success) {
        setNotis((prev) => prev.map((n) => ({ ...n, status: "read" })));
        setModalMessage(response.message);
        setSuccessOpen(true);
      }
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const markOneAsRead = async (id) => {
    setLoading(true);

    const payload = {
      notification_ids: [id],
      mark_all: false
    };

    try {
      const response = await markOneNotAsRead(payload);

      if (response.success) {
        setNotis((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
        );
        setModalMessage(response.message);
        setSuccessOpen(true);
      }
    } catch (error) {
      setModalMessage(error.response?.data?.detail || "Error marking notification as read");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const iconDot = (type) => {
    const map = {
      success: "bg-green-500",
      warning: "bg-yellow-500",
      info: "bg-purple-500",
    };
    return map[type] || "bg-gray-400";
  };

  return (
    <>
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
                      disabled={loading}
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
                      className={`p-4 transition-colors ${n.status === "unread"
                          ? "bg-[#FEF7FF] border-l-4 border-purple-500"
                          : "bg-white opacity-70"
                        }`}
                    >
                      <div className="flex items-start gap-3">

                        <span
                          className={`mt-1 inline-block h-[32px] w-[32px] rounded-full ${iconDot(
                            n.type
                          )}`}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${n.status === "unread" ? "text-black" : "text-gray-500"
                              }`}
                          >
                            {n.title}
                          </p>
                          <p
                            className={`text-sm ${n.status === "unread" ? "text-gray-600" : "text-gray-400"
                              }`}
                          >
                            {n.body}
                          </p>
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
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                <FiUser size={20} />
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Bienvenido!
              <br />
              {username}
            </span>
            <FiUser className="text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </header>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Login Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Login Failed"
        message={modalMessage}
      />
    </>
  );
}
