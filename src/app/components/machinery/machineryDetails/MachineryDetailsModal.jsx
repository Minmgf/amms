'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes, FaTools } from 'react-icons/fa'
import { FiChevronDown, FiDownload, FiFileText } from 'react-icons/fi'

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - selectedMachine: object | null
 * - formatDate: (dateString?: string) => string
 */
export default function MachineryDetailsModal({
    isOpen,
    onClose,
    selectedMachine,
    formatDate,
}) {
    // Tabs desktop (sin headlessui)
    const [activeTab, setActiveTab] = useState('general') // 'general' | 'tech' | 'docs'

    // Acordeones mobile (sin headlessui)
    const [accTrackerOpen, setAccTrackerOpen] = useState(true)
    const [accUsageOpen, setAccUsageOpen] = useState(true)
    const [accSpecificOpen, setAccSpecificOpen] = useState(false)

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose?.() }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 md:bg-black/50 md:backdrop-blur-sm z-[60]" />
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-full max-w-6xl bg-white md:rounded-2xl shadow-xl overflow-y-auto max-h-screen mt-20 md:max-h-[90vh] z-[70]"
                >
                    <div className="p-0 py-6 md:p-6">
                        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
                            <Dialog.Title className="text-2xl font-medium">Detailed Information</Dialog.Title>
                            <button onClick={onClose}>
                                <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>

                        {/* ============== DESKTOP ============== */}
                        <div className="hidden md:block">
                            {/* --- TABS --- */}
                            <div className="flex justify-center border-b border-[#737373] mb-6">
                                {['general', 'tech', 'docs'].map((key, idx) => {
                                    const labels = ['General Information', 'Technical Specifications', 'Documents & Maintenance']
                                    const label = labels[idx]
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTab(key)}
                                            type="button"
                                            className={`w-40 px-4 py-2 -mb-px border-b-2 text-sm font-medium
                         whitespace-normal text-center leading-snug cursor-pointer
                         ${activeTab === key ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* === General Information (DESKTOP) === */}
                            {activeTab === 'general' && (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#737373] h-full rounded-md flex items-center justify-center">
                                            <span className="text-white">Photo here</span>
                                        </div>

                                        <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                            <h3 className="font-semibold text-lg mb-3">General Data Sheet</h3>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between text-[#525252]">Serial Number:
                                                    <span className="font-[400] text-black">{selectedMachine?.serial_number}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Name:
                                                    <span className="font-[400] text-black">{selectedMachine?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Brand:
                                                    <span className="font-[400] text-black">{selectedMachine?.brand}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Model:
                                                    <span className="font-[400] text-black">{selectedMachine?.model}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Manufacture Year:
                                                    <span className="font-[400] text-black">{selectedMachine?.year}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Type:
                                                    <span className="font-[400] text-black">{selectedMachine?.type}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Origin:
                                                    <span className="font-[400] text-black">{selectedMachine?.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ubication GPS */}
                                    <div className="mt-8">
                                        <h3 className="font-semibold text-lg mb-2">Ubication GPS</h3>
                                        <div className="border border-[#E5E7EB] rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-medium text-emerald-700">ACTIVE</span>
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1.5 text-xs font-medium">
                                                    {selectedMachine?.location || 'Bogotá, Colombia'}
                                                </span>
                                            </div>
                                            <div className="w-full h-56 md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-400">Map placeholder</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tracker & Usage (cards) */}
                                    <div className="grid md:grid-cols-2 gap-6 mt-5">
                                        <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                            <h4 className="font-semibold mb-3">Tracker Data Sheet</h4>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between text-[#525252]">GPS Serial Number:
                                                    <span className="font-[400] text-black">—</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Chassis Number:
                                                    <span className="font-[400] text-black">—</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Engine Number:
                                                    <span className="font-[400] text-black">—</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                            <h4 className="font-semibold mb-3">Usage Information</h4>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between text-[#525252]">Acquisition Date:
                                                    <span className="font-[400] text-black">{formatDate?.(selectedMachine?.acquisition_date)}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Usage Status:
                                                    <span className="font-[400] text-black">{selectedMachine?.status}</span>
                                                </div>
                                                <div className="flex justify-between text-[#525252]">Tenure:
                                                    <span className="font-[400] text-black">{selectedMachine?.tenure}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* === Technical Specifications (DESKTOP) === */}
                            {activeTab === 'tech' && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Capacity and Performance */}
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Capacity and Performance</h3>
                                        <div className="flex flex-col gap-3">
                                            <Row label="Tank Capacity" value="410 L" />
                                            <Row label="Carrying Capacity" value="1.2 m³" />
                                            <Row label="Operating Weight" value="20,500 kg" />
                                            <Row label="Max Speed" value="5.5 km/h" />
                                            <Row label="Draft Force" value="186 kN" />
                                            <Row label="Max Operating Altitude" value="4,500 m" />
                                            <Row label="Min Performance" value="500 kg" />
                                            <Row label="Max Performance" value="3,600 kg" />
                                        </div>
                                    </div>

                                    {/* Dimensions and Weight */}
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Dimensions and Weight</h3>
                                        <div className="flex flex-col gap-3">
                                            <Row label="Length" value="9.75 m" />
                                            <Row label="Width" value="2.65 m" />
                                            <Row label="Height" value="3.15 m" />
                                            <Row label="Net Weight" value="19,800 kg" />
                                        </div>
                                    </div>

                                    {/* Auxiliary and Hydraulic Systems */}
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Auxiliary and Hydraulic Systems</h3>
                                        <div className="flex flex-col gap-3">
                                            <Row label="Air Conditioning" value="Automatic A/C" />
                                            <Row label="A/C Consumption" value="2.5 L/h" />
                                            <Row label="Hydraulic Pressure" value="350 bar" />
                                            <Row label="Pump Flow Rate" value="265 L/min" />
                                            <Row label="Hydraulic Reservoir Capacity" value="240 L" />
                                        </div>
                                    </div>

                                    {/* Engine and Transmission */}
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Engine and Transmission</h3>
                                        <div className="flex flex-col gap-3">
                                            <Row label="Engine Power" value="158 HP" />
                                            <Row label="Engine Type" value="Diesel Turbo" />
                                            <Row label="Cylinder Capacity" value="6.8 L" />
                                            <Row label="Number of cylinders & arrangement" value="6 en línea" />
                                            <Row label="Traction" value="Orugas" />
                                            <Row label="Fuel Consumption" value="18 L/h" />
                                            <Row label="Transmission System" value="Hidrostática" />
                                        </div>
                                    </div>

                                    {/* Regulations and Safety */}
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Regulations and Safety</h3>
                                        <div className="flex flex-col gap-3">
                                            <Row label="Emissions Level" value="Euro 1" />
                                            <Row label="Cabin Type" value="ROPS/FOPS" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === Documents & Maintenance (DESKTOP) === */}
                            {activeTab === 'docs' && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Documentation</h3>
                                        <ul className="flex flex-col gap-3">
                                            <DocItem label="Operator's Manual" />
                                            <DocItem label="Import Certificate" />
                                        </ul>
                                    </div>

                                    <div className="border rounded-xl p-4 border-[#E5E7EB]">
                                        <h3 className="font-semibold text-lg mb-3">Periodic Maintenance</h3>
                                        <ul className="flex flex-col gap-3">
                                            {[
                                                ['Oil Change', '250 hrs'],
                                                ['Hydraulic Filter', '1000 hrs'],
                                                ['General Inspection', '500 hrs'],
                                                ['Engine Overhaul', '2000 hrs'],
                                            ].map(([label, hours]) => (
                                                <li key={label} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            <FaTools className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                        <span className="text-sm text-[#525252]">{label}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{hours}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============== MOBILE ============== */}
                        <div className="md:hidden bg-[#F0F0F0]">

                            <div className='px-4 md:px-0 bg-white'>
                                {/* Imagen / placeholder */}
                                <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-gray-400">Photo here</span>
                                </div>

                                {/* General Technical Data */}
                                <h3 className="text-xl font-semibold mb-3">General Technical Data</h3>
                                <div className="rounded-xl overflow-hidden">
                                    {[
                                        ['Name', selectedMachine?.name || '—'],
                                        ['Brand', selectedMachine?.brand || '—'],
                                        ['Model', selectedMachine?.model || '—'],
                                        ['Facturate In', selectedMachine?.year || '—'],
                                        ['Type', selectedMachine?.type || '—'],
                                        ['Manufacturer', 'Caterpillar Inc.'],
                                        ['Serial Number', selectedMachine?.serial_number || '—'],
                                        ['Origin City', selectedMachine?.location || '—'],
                                        ['Tariff Subheading', '8429.11.00'],
                                        ['Machine Type', 'Crawler Tractor'],
                                    ].map(([label, value], idx) => (
                                        <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                                            <span className="text-sm text-gray-900 font-[500]">{label}</span>
                                            <span className="text-sm text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>


                            {/* Mapa + badges */}
                            <div className="mt-2">
                                <div className="w-full aspect-[16/9] bg-gray-200 relative overflow-hidden">
                                    <div className="absolute bottom-2 left-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-gray-700">Now in production</span>
                                    </div>
                                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow border">
                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-xs text-gray-700">In Rivera</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-gray-400">Map placeholder</span>
                                    </div>
                                </div>
                            </div>

                            {/* Accordion: Tracker Technical Data */}
                            <div className="mt-2 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setAccTrackerOpen(v => !v)}
                                    className="w-full flex items-center justify-between px-4 py-5 bg-white"
                                >
                                    <span className="font-bold text-xl">Tracker Technical Data</span>
                                    <FiChevronDown className={`transition ${accTrackerOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {accTrackerOpen && (
                                    <div className='bg-white'>
                                        {[
                                            ['Terminal Serial Number', 'TRK-2024-987654'],
                                            ['GPS Device Serial Number', 'GPS-AXT-56789'],
                                            ['Chassis Number', '1HGBH41JXMN019186'],
                                            ['Engine Number', 'D13-7654321'],
                                        ].map(([label, value], idx) => (
                                            <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                                                <span className="text-sm text-gray-900 font-[500]">{label}</span>
                                                <span className="text-sm text-gray-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Accordion: Usage Information */}
                            <div className="mt-2 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setAccUsageOpen(v => !v)}
                                    className="w-full flex items-center justify-between px-4 py-5 bg-white"
                                >
                                    <span className="font-bold text-xl">Usage Information</span>
                                    <FiChevronDown className={`transition ${accUsageOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {accUsageOpen && (
                                    <div className='bg-white'>
                                        {[
                                            ['Acquisition date', formatDate?.(selectedMachine?.acquisition_date) || '—'],
                                            ['Usage status', selectedMachine?.status || '—'],
                                            ['Used hours', '—'],
                                            ['Mileage', '—'],
                                            ['Tenure', selectedMachine?.tenure || '—'],
                                            ['Ending contract date', 'N/A'],
                                        ].map(([label, value], idx) => (
                                            <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
                                                <span className="text-sm text-gray-900 font-[500]">{label}</span>
                                                <span className="text-sm text-gray-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Accordion: Specific Technical Data */}
                            <div className="mt-2 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setAccSpecificOpen(v => !v)}
                                    className="w-full flex items-center justify-between px-4 py-5 bg-white"
                                >
                                    <span className="font-bold text-xl">Specific Technical Data</span>
                                    <FiChevronDown className={`transition ${accSpecificOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {accSpecificOpen && (
                                    <div className='bg-white'>
                                        {[
                                            ['Engine Power', '158 HP'],
                                            ['Hydraulic Pressure', '350 bar'],
                                            ['Pump Flow Rate', '265 L/min'],
                                        ].map(([label, value], idx) => (
                                            <div key={label} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t' : ''} border-gray-200`}>
  <span className="text-sm text-gray-900 font-[500]">{label}</span>
                                                <span className="text-sm text-gray-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Documentation */}
                            <div className="mt-2 overflow-hidden bg-white">
                                <div className="px-4 py-5 font-bold text-xl">Documentation</div>
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Operational manual</span>
                                    <button className="px-3 py-1.5 rounded-md text-white bg-black text-sm">View</button>
                                </div>
                            </div>

                            {/* Periodic maintenance (lista tipo chips) */}
                            <div className="mt-3 bg-white p-4 md:p-0">
                                <div className="font-semibold mb-2">Periodic maintenance</div>
                                <div className="space-y-2">
                                    {[
                                        ['Oil level check', '50 hours'],
                                        ['Transmission oil and filter change', '500 hours'],
                                        ['Radiator cleaning', '2000 hours'],
                                    ].map(([task, hours]) => (
                                        <div key={task} className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-2">
                                            <span className="text-sm text-gray-700 truncate">{task}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-600 border">{hours}</span>
                                                <button className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-3 w-full rounded-md bg-gray-400/80 text-white py-2">Submit</button>
                            </div>
                        </div>
                        {/* ============== FIN MOBILE ============== */}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

/* ------- Subcomponentes pequeños para mantener exactamente el mismo estilo ------- */

function Row({ label, value }) {
    return (
        <div className="flex justify-between text-[#525252]">
            {label}: <span className="font-[400] text-black">{value}</span>
        </div>
    )
}

function DocItem({ label }) {
    return (
        <li className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-[#525252]">{label}</span>
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100" title="Download">
                <FiDownload className="w-5 h-5 text-gray-600" />
            </button>
        </li>
    )
}
