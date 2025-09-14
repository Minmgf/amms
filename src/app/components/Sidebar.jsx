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
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import {
  SuccessModal,
  ErrorModal,
  ConfirmModal,
} from "./shared/SuccessErrorModal";
import { useTheme } from "@/contexts/ThemeContext";
import { usePermissions } from "@/contexts/PermissionsContext"; // 👈 Agregar import

export default function Sidebar({ isOpen, setIsOpen }) {
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();
  const router = useRouter();
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotis, setShowNotis] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme Context
  const { currentTheme } = useTheme();
  
  // Permissions Context 👈 Agregar hook de permisos
  const { hasPermission, hasRole, clearPermissions } = usePermissions();

  // Función para determinar si un menú debe mostrarse
  const shouldShowMenuItem = (item) => {
    // Si no tiene permisos definidos, siempre mostrar (como Home)
    if (!item.permissions && !item.roles) {
      return true;
    }

    // Verificar roles si están definidos
    if (item.roles && item.roles.length > 0) {
      const hasRequiredRole = item.roles.some(role => hasRole(role));
      if (!hasRequiredRole) return false;
    }

    // Verificar permisos si están definidos
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.some(permission => hasPermission(permission));
    }

    return true;
  };

  // Función para verificar si al menos un submenú es visible
  const hasVisibleSubItems = (subItems) => {
    if (!subItems) return false;
    return subItems.some(subItem => shouldShowMenuItem(subItem));
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await logout();
      clearPermissions(); // 👈 Limpiar permisos al hacer logout
      setModalMessage(response.message);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/login");
      }, 2000);
    } catch (error) {
      setModalMessage(error.response.data.detail);
      setErrorOpen(true);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

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

  // 👈 Definir menuItems con permisos asociados
  const menuItems = [
    { 
      name: "Home", 
      icon: <FaHome />, 
      path: "/home"
      // Sin permisos - siempre visible
    },
    { 
      name: "Machinery", 
      icon: <FaCogs />, 
      path: "/machinery",
      permissions: [],
      module: "machinery"
    },
    {
      name: "Maintenance",
      icon: <FaTools />,
      path: "/maintenance",
      permissions: [],
      module: "maintenance",
      sub: [
        {
          name: "Schedule Maintenance",
          icon: <FaCalendarCheck />,
          path: "/maintenance/scheduleMaintenance",
          permissions: [],
        },
        {
          name: "Maintenance Requests",
          icon: <FaRegNewspaper />,
          path: "/maintenance/maintenanceRequest",
          permissions: [],
        },
      ],
    },
    {
      name: "Payroll",
      icon: <FaMoneyCheckAlt />,
      path: "/payroll",
      permissions: [],
      module: "payroll",
      sub: [
        { 
          name: "Reports", 
          icon: <FaFileInvoice />, 
          path: "/payroll/reports",
          permissions: [],
        },
        {
          name: "Novelty",
          icon: <FaClipboardCheck />,
          path: "/payroll/novelty",
          permissions: [],
        },
        {
          name: "Payrolls",
          icon: <FaClipboardList />,
          path: "/payroll/payrolls",
          permissions: [],
        },
      ],
    },
    {
      name: "Requests",
      icon: <FaClipboardList />,
      path: "/requests",
      permissions: [],
      module: "requests",
      sub: [
        { 
          name: "Clients", 
          icon: <FaUsers />, 
          path: "/requests/clients",
          permissions: [],
        },
        {
          name: "Service Managements",
          icon: <FaTools />,
          path: "/requests/serviceManagement",
          permissions: [],
        },
      ],
    },
    {
      name: "User Management",
      icon: <FaUsers />,
      path: "/userManagement",
      permissions: [],
      module: "users",
      sub: [
        {
          name: "Role Management",
          icon: <FaUserShield />,
          path: "/userManagement/roleManagement",
          permissions: ["roles.view"],
        },
        {
          name: "Audit Log",
          icon: <FaHistory />,
          path: "/userManagement/auditLog",
          permissions: [],
        },
      ],
    },
    {
      name: "Monitoring",
      icon: <FaBroadcastTower />,
      path: "/monitoring",
      permissions: [],
      module: "monitoring",
      sub: [
        {
          name: "Devices Management",
          icon: <FaDesktop />,
          path: "/monitoring/devicesManagement",
          permissions: [],
        },
        {
          name: "Threshold",
          icon: <FaRssSquare />,
          path: "/monitoring/threshold",
          permissions: [],
        },
      ],
    },
    {
      name: "Parameterization",
      icon: <MdSettings />,
      path: "/parametrization",
      permissions: [],
      roles: [], // Solo administradores
    },
  ];

  // Filtrar menús visibles
  const visibleMenuItems = menuItems.filter(item => {
    // Si tiene submenús, verificar si al menos uno es visible
    if (item.sub) {
      const hasVisibleSubs = hasVisibleSubItems(item.sub);
      const canAccessParent = shouldShowMenuItem(item);
      return canAccessParent || hasVisibleSubs;
    }
    
    return shouldShowMenuItem(item);
  });

  return (
    <>
      {!isOpen && (
        <button
          className="p-2 fixed top-2 left-2 z-50 bg-surface text-primary border-primary rounded-theme-lg backdrop-blur-sm hover:bg-hover transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={18} />
        </button>
      )}

      {/* Overlay con desenfoque para móvil cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`sidebar-theme fixed top-0 left-0 h-screen overflow-y-auto flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
      >
        <button
          className="absolute top-2 right-2 p-2 rounded-theme-lg hover:bg-hover lg:block text-secondary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <FiX size={18} />
        </button>

        <div className="py-4 px-2">
          <img
            src="./images/logoHorizontal.png"
            alt="SIGMA"
          />
        </div>

        {/* MENÚ PRINCIPAL */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-2">
            {visibleMenuItems.map((item) => {
              const isActiveParent =
                pathname === item.path || pathname.startsWith(item.path + "/");

              return (
                <div key={item.name}>
                  {!item.sub ? (
                    <Link
                      href={item.path}
                      className={`nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors ${
                        isActiveParent ? "nav-item-active" : ""
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
                        className={`nav-item-theme flex justify-between items-center w-full p-2 rounded-theme-lg transition-colors ${
                          isActiveParent ? "nav-item-active" : ""
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
                        <div className="w-full mt-1 flex flex-col gap-1 text-sm pl-6">
                          {item.sub
                            .filter(subItem => shouldShowMenuItem(subItem)) // 👈 Filtrar submenús
                            .map((sub) => {
                              const isActiveSub = pathname === sub.path;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.path}
                                  className={`nav-sub-item-theme p-2 rounded-theme-lg text-left flex items-center gap-3 transition-colors ${
                                    isActiveSub ? "nav-sub-item-active" : ""
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

        {/* BOTÓN LOGOUT */}
        <div className="p-4 border-primary mt-auto flex justify-center">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-error text-sm hover:text-error/80 transition-colors rounded-theme-md hover:bg-hover"
          >
            <FiLogOut /> Log Out
          </button>
        </div>
      </aside>
      
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Logout Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Logout Failed"
        message={modalMessage}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-500 active:bg-red-700"
        cancelColor="bg-gray-600 hover:bg-gray-500"
      />
    </>
  );
}