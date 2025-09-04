"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import React from "react";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false);
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
    <div className="flex flex-col h-screen">
      {/* Header siempre arriba */}
      <Header />

      {/* Contenido debajo del header */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isOpen ? "ml-64" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
