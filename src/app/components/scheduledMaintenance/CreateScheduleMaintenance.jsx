import React, { useState } from 'react';
import { FiX } from "react-icons/fi";

const ScheduleMaintenanceModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        machineSelector: '',
        maintenanceType: 'Preventive',
        scheduleDate: '21/03/2025',
        scheduleHour: '08',
        scheduleMinute: '00',
        scheduleAMPM: 'AM',
        assignedTechnician: 'Jaime Peña',
        maintenanceDetails: ''
    });

    // Mock data - en producción vendría de props o servicios
    const machines = [
        { id: 1, name: 'Seleccionar máquina' },
        { id: 2, name: 'Máquina A' },
        { id: 3, name: 'Máquina B' },
        { id: 4, name: 'Máquina C' }
    ];

    const technicians = [
        { id: 1, name: 'Jaime Peña' },
        { id: 2, name: 'María González' },
        { id: 3, name: 'Carlos Rodríguez' }
    ];

    const maintenanceTypes = ['Preventive', 'Corrective', 'Predictive'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        const scheduleTime = `${formData.scheduleHour}:${formData.scheduleMinute} ${formData.scheduleAMPM}`;
        const submitData = {
            ...formData,
            scheduleTime
        };
        onSubmit?.(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" id="create-schedule-maintenance-modal">
            <div className="parametrization-modal" style={{ width: '56rem', maxWidth: '90vw' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-primary">Programar mantenimiento</h2>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-primary"
                        style={{ transition: 'var(--transition-fast)' }}
                        aria-label="Cerrar modal"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Primera fila: Machine selector y Maintenance type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Máquina
                            </label>
                            <select
                                aria-label="Machine Select"
                                className="parametrization-input"
                                value={formData.machineSelector}
                                onChange={(e) => handleInputChange('machineSelector', e.target.value)}
                            >
                                <option value="" disabled>Seleccionar máquina</option>
                                {machines.slice(1).map(machine => (
                                    <option key={machine.id} value={machine.id}>
                                        {machine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Tipo de mantenimiento
                            </label>
                            <select
                                aria-label="Maintenance Type Select"
                                className="parametrization-input"
                                value={formData.maintenanceType}
                                onChange={(e) => handleInputChange('maintenanceType', e.target.value)}
                            >
                                {maintenanceTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Segunda fila: Schedule date, Schedule hour y Assigned technician */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Fecha programada
                            </label>
                            <input
                                type="text"
                                aria-label="Schedule Date Input"
                                className="parametrization-input"
                                value={formData.scheduleDate}
                                onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                                placeholder="DD/MM/YYYY"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Hora programada
                            </label>
                            <div className="flex gap-1">
                                <select
                                    aria-label="Schedule Hour Select"
                                    className="parametrization-input"
                                    style={{ flex: '1' }}
                                    value={formData.scheduleHour}
                                    onChange={(e) => handleInputChange('scheduleHour', e.target.value)}
                                >
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const hour = (i + 1).toString().padStart(2, '0');
                                        return (
                                            <option key={hour} value={hour}>
                                                {hour}
                                            </option>
                                        );
                                    })}
                                </select>
                                <select
                                    className="parametrization-input"
                                    style={{ flex: '1' }}
                                    value={formData.scheduleMinute}
                                    onChange={(e) => handleInputChange('scheduleMinute', e.target.value)}
                                >
                                    {['00', '15', '30', '45'].map(minute => (
                                        <option key={minute} value={minute}>
                                            {minute}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="parametrization-input"
                                    style={{ flex: '0.8' }}
                                    value={formData.scheduleAMPM}
                                    onChange={(e) => handleInputChange('scheduleAMPM', e.target.value)}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Técnico asignado
                            </label>
                            <select
                                aria-label="Assigned Technician Select"
                                className="parametrization-input"
                                value={formData.assignedTechnician}
                                onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
                            >
                                {technicians.map(technician => (
                                    <option key={technician.id} value={technician.name}>
                                        {technician.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Maintenance details */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Detalles de mantenimiento
                        </label>
                        <textarea
                            aria-label="Maintenance Details Textarea"
                            className="parametrization-input"
                            rows="4"
                            placeholder="Escribir comentarios..."
                            value={formData.maintenanceDetails}
                            onChange={(e) => handleInputChange('maintenanceDetails', e.target.value)}
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    {/* Botón Schedule */}
                    <div className="flex justify-center pt-4">
                        <button
                            aria-label="Schedule Maintenance Button"
                            onClick={handleSubmit}
                            className="btn-theme btn-primary"
                            style={{
                                padding: '0.75rem 3rem',
                                borderRadius: 'var(--border-radius-md)',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            Programar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMaintenanceModal;