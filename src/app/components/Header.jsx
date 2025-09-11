import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiBell, FiUser, FiX } from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import { getUserData } from "@/services/profileService";
import { markAllNotAsRead, markOneNotAsRead } from "@/services/notificationService";
import { SuccessModal, ErrorModal } from "./shared/SuccessErrorModal";
import { useTheme } from "@/contexts/ThemeContext";
import useNotifications from "@/hooks/useNotifications";

export default function Header() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showNotis, setShowNotis] = useState(false);
  const panelRef = useRef(null);
  const [message, setMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook del tema global
  const { 
    currentTheme, 
    getAllThemes, 
    getThemeNames, 
    changeTheme 
  } = useTheme();

  // Hook de notificaciones
  const { notifications: notis, reload } = useNotifications();
  const unreadCount = notis.filter(n => n.status === "unread").length;

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
        reload();
        setModalMessage(response.message);
        setSuccessOpen(true);
      }
    } catch (error) {
      setModalMessage(error.response?.data?.detail || "Error marking all as read");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const markOneAsRead = async (id) => {
    setLoading(true);

    const payload = {
      notification_ids: [id],
      mark_all: false,
    };

    try {
      const response = await markOneNotAsRead(payload);
      if (response.success) {
        reload();
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
      <header className="header-theme w-full flex items-center justify-end px-6 py-4 relative">
        <div className="flex items-center gap-4">
          {/* Botón Tema */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-theme-md hover:bg-hover text-primary transition-colors"
            >
              <MdPalette size={20} />
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-primary rounded-theme-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs text-secondary mb-2 px-2">Seleccionar Tema:</div>
                  {getThemeNames().map(themeKey => {
                    const theme = getAllThemes()[themeKey];
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          changeTheme(themeKey);
                          setThemeMenuOpen(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-sm rounded-theme-sm mb-1 transition-colors ${
                          currentTheme === themeKey 
                            ? 'bg-accent text-white' 
                            : 'text-primary hover:bg-hover'
                        }`}
                      >
                        {theme.name}
                      </button>
                    );
                  })}
                  <hr className="border-primary my-2" />
                  <Link 
                    href="/parametrization/styles"
                    className="block w-full px-3 py-2 text-left text-sm text-accent hover:bg-hover rounded-theme-sm transition-colors"
                    onClick={() => setThemeMenuOpen(false)}
                  >
                    🎨 Personalizar Temas
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notificaciones */}
          <button
            type="button"
            onClick={() => setShowNotis((s) => !s)}
            className="relative inline-flex items-center justify-center rounded-theme-md p-2 hover:bg-hover text-primary cursor-pointer transition-colors"
            aria-haspopup="dialog"
            aria-expanded={showNotis}
            aria-controls="notifications-panel"
            aria-label="Open notifications"
          >
            <FiBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-error text-white text-[10px] leading-4 text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Panel Notificaciones */}
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
                className="absolute right-4 top-4 w-[380px] max-w-[92vw] rounded-theme-xl modal-theme overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary bg-background">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-primary">Notifications</h2>
                    <span className="text-sm text-secondary">
                      {unreadCount} {unreadCount === 1 ? "unread" : "unread"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={markAllAsRead}
                      disabled={loading}
                      className="text-sm text-accent cursor-pointer hover:underline"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={() => setShowNotis(false)}
                      className="rounded-theme-md cursor-pointer hover:bg-hover p-1 transition-colors"
                      aria-label="Close notifications"
                    >
                      <FiX size={18} className="text-secondary" />
                    </button>
                  </div>
                </div>
                <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border">
                  {notis.map((n) => (
                    <li
                      key={n.id}
                      className={`p-4 transition-colors ${n.status === "unread"
                          ? "bg-surface border-l-4 border-accent"
                          : "bg-background opacity-70"
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
                            className={`font-medium ${n.status === "unread" ? "text-primary" : "text-secondary"
                              }`}
                          >
                            {n.title}
                          </p>
                          <p
                            className={`text-sm ${n.status === "unread" ? "text-secondary" : "text-secondary opacity-60"
                              }`}
                          >
                            {n.body}
                          </p>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-secondary">{n.date}</span>
                            {n.status === "unread" ? (
                              <button
                                onClick={() => markOneAsRead(n.id)}
                                className="text-xs text-accent cursor-pointer hover:underline"
                              >
                                Mark as read
                              </button>
                            ) : (
                              <span className="text-xs text-secondary">Read</span>
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
            className="flex items-center gap-2 bg-surface hover:bg-hover px-3 py-1 rounded-theme-full cursor-pointer transition-colors"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                <FiUser size={20} />
              </div>
            )}
            <span className="text-sm text-primary">
              Bienvenido!
              <br />
              {username}
            </span>
            <FiUser className="text-secondary" />
          </Link>
        </div>
      </header>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
}
