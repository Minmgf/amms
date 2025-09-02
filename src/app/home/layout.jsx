"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import React from "react";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);


  return (
    <html lang="en">
      <body className="flex h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"
            }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
