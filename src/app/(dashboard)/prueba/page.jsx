"use client";
import { useState } from "react";
import MultiStepFormModal from "@/app/components/machinery/multistepForm/MultistepFormModal";

export default function FormLauncher() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="p-6">
                {/* Botón que abre el formulario */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Abrir Formulario
                </button>
            </div>
            <MultiStepFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
