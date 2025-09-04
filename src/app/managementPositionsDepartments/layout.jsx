"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <html lang="en">
      <body className="flex h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`flex-1 p-4 bg-gray-50 overflow-y-auto transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"
            }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
