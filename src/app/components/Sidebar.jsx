"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    FaHome, FaCogs, FaTools, FaMoneyCheckAlt, FaClipboardList, FaUsers,
    FaBroadcastTower, FaCalendarCheck, FaRegNewspaper, FaFileInvoice,
    FaClipboardCheck, FaUserShield, FaHistory, FaDesktop, FaRssSquare
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { FiLogOut, FiBell, FiMenu, FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";
import Link from "next/link";

export default function Sidebar({ isOpen, setIsOpen }) {
    const [openMenus, setOpenMenus] = useState({});
    const pathname = usePathname(); // 👈 detecta la ruta actual

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

    const menuItems = [
        { name: "Home", icon: <FaHome />, path: "/home" },
        { name: "Machinery", icon: <FaCogs />, path: "/machinery" },
        {
            name: "Maintenance", icon: <FaTools />, path: "/maintenance",
            sub: [
                { name: "Schedule Maintenance", icon: <FaCalendarCheck />, path: "/maintenance/scheduleMaintenance" },
                { name: "Maintenance Requests", icon: <FaRegNewspaper />, path: "/maintenance/maintenanceRequest" },
            ],
        },
        {
            name: "Payroll", icon: <FaMoneyCheckAlt />, path: "/payroll",
            sub: [
                { name: "Reports", icon: <FaFileInvoice />, path: "/payroll/reports" },
                { name: "Novelty", icon: <FaClipboardCheck />, path: "/payroll/novelty" },
                { name: "Payrolls", icon: <FaClipboardList />, path: "/payroll/payrolls" },
            ],
        },
        {
            name: "Requests", icon: <FaClipboardList />, path: "/requests",
            sub: [
                { name: "Clients", icon: <FaUsers />, path: "/requests/clients" },
                { name: "Service Managements", icon: <FaTools />, path: "/requests/serviceManagement" },
            ],
        },
        {
            name: "User Management", icon: <FaUsers />, path: "/userManagement",
            sub: [
                { name: "Role Management", icon: <FaUserShield />, path: "/userManagement/roleManagement" },
                { name: "Audit Log", icon: <FaHistory />, path: "/userManagement/auditLog" },
            ],
        },
        {
            name: "Monitoring", icon: <FaBroadcastTower />, path: "/monitoring",
            sub: [
                { name: "Devices Management", icon: <FaDesktop />, path: "/monitoring/devicesManagement" },
                { name: "Threshold", icon: <FaRssSquare />, path: "/monitoring/threshold" },
            ],
        },
        { name: "Parameterization", icon: <MdSettings />, path: "/parametrization" },
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
                                        ${pathname === "/userProfile"
                                        ? "bg-yellow-200 font-medium text-black"
                                        : "hover:bg-gray-100 text-gray-700"}`}
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
                        <FiBell className="text-xl cursor-pointer text-gray-700" />
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
                                    pathname === item.path || pathname.startsWith(item.path + "/");

                                return (
                                    <div key={item.name}>
                                        {!item.sub ? (
                                            <Link
                                                href={item.path}
                                                className={`flex justify-between items-center w-full p-2 rounded-lg transition 
                                                ${isActiveParent
                                                        ? "bg-yellow-200 font-medium text-black"
                                                        : "hover:bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-3">{item.icon} {item.name}</span>
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href={item.path}
                                                    onClick={() => { toggleMenu(item.name) }}
                                                    className={`flex justify-between items-center w-full p-2 rounded-lg transition 
                                                            ${isActiveParent
                                                            ? "bg-yellow-200 font-medium text-black"
                                                            : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-3">{item.icon} {item.name}</span>
                                                    {openMenus[item.name] ? <FiChevronDown /> : <FiChevronRight />}
                                                </Link>

                                                {openMenus[item.name] && (
                                                    <div className="ml-8 flex flex-col gap-1 text-sm text-gray-600">
                                                        {item.sub.map((sub) => {
                                                            const isActiveSub = pathname === sub.path;
                                                            return (
                                                                <Link
                                                                    key={sub.name}
                                                                    href={sub.path}
                                                                    className={
                                                                        `p-1 hover:text-black hover:font-medium rounded-lg text-left flex items-center gap-3 
                                                                        ${isActiveSub ? "bg-gray-200 font-medium" : ""
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
        </>
    );
}
