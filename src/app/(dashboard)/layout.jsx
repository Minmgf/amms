"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import React from "react";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token"); // 👈 revisar cookie
    if (!token) {
      router.replace("/login"); // si no hay token, redirige
    } else {
      setLoading(false); // hay sesión, puede mostrar dashboard
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"
          }`}
      >
        {children}
      </main>
    </div>
  );
}
