"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import React from "react";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Home");



  return (
    <div className="flex w-full h-full">
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        active={activeMenu}
        setActive={setActiveMenu}
      />
      <main
        className={`flex-1 p-4 overflow-y-auto transition-all duration-300 h-full ${isOpen ? "ml-64" : "ml-0"
          }`}
      >
        {React.cloneElement(children, { activeMenu: activeMenu })}
      </main>
    </div>
  );
}
