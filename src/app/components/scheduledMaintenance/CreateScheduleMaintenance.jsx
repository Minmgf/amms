import React, { useState, useEffect } from 'react';
import { FiX } from "react-icons/fi";
import { useForm, Controller, set } from 'react-hook-form';
import { getMaintenanceTypes, getActiveTechnicians, getActiveMachineries, createMaintenanceScheduling } from '@/services/maintenanceService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';

const ScheduleMaintenanceModal = ({ isOpen, onClose, onSubmit }) => {
    const [machines, setMachines] = useState([]);
    const [maintenanceTypes, setMaintenanceTypes] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: {
            machineSelector: '',
            maintenanceType: '',
            scheduleDate: '',
            scheduleHour: '',
            scheduleMinute: '',
            scheduleAMPM: '',
            assignedTechnician: '',
            maintenanceDetails: ''
        }
    });

    useEffect(() => {
        const fetchMaintenanceTypes = async () => {
            try {
                const types = await getMaintenanceTypes();
                setMaintenanceTypes(types);
            } catch (error) {
                console.error('Error fetching maintenance types:', error);
            }
        };

        const fetchActiveTechnicians = async () => {
            try {
                const technicians = await getActiveTechnicians();
                setTechnicians(technicians);
            } catch (error) {
                console.error('Error fetching active technicians:', error);
            }
        };
        
        const fetchActiveMachineries = async () => {
            try {
                const machines = await getActiveMachineries();
                setMachines(machines.data);
            } catch (error) {
                console.error('Error fetching active machines:', error);
            }
        };
        
        if (isOpen) {
            fetchMaintenanceTypes();
            fetchActiveTechnicians();
            fetchActiveMachineries();
        }
    }, [isOpen]);

    // Función para convertir fecha DD/MM/YYYY y hora a formato ISO 8601
    const formatToISO8601 = (date, hour, minute, period) => {
        // Convertir hora de 12h a 24h
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        
        // Formato ISO 8601: YYYY-MM-DDThh:mm:ss
        return `${date}T${hour24.toString().padStart(2, '0')}:${minute}:00`;
    };

    const onSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        try {
            const scheduledAt = formatToISO8601(
                data.scheduleDate,
                data.scheduleHour,
                data.scheduleMinute,
                data.scheduleAMPM
            );

            const submitData = {
                id_machinery: data.machineSelector,
                scheduled_at: scheduledAt,
                details: data.maintenanceDetails,
                assigned_technician: data.assignedTechnician,
                maintenance_type: data.maintenanceType,
            };

            const response = await createMaintenanceScheduling(submitData);
            setModalMessage(response.message || 'Mantenimiento programado con éxito.');
            setSuccessOpen(true);
            onSubmit?.();
            reset();
        } catch (error) {
            setModalMessage(error.response?.data?.message || 'Error al programar el mantenimiento.');
            setErrorOpen(true);
        } finally {
            setIsSubmitting(false);
        }
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

                <form onSubmit={handleSubmit(onSubmitForm)}>
                    <div className="space-y-4">
                        {/* Primera fila: Machine selector y Maintenance type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Máquina*
                                </label>
                                <Controller
                                    name="machineSelector"
                                    control={control}
                                    rules={{ required: 'Debe seleccionar una máquina' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            aria-label="Machine Select"
                                            className={`parametrization-input ${errors.machineSelector ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seleccionar máquina</option>
                                            {machines.map(machine => (
                                                <option key={machine.id_machinery} value={machine.id_machinery}>
                                                    {machine.machinery_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.machineSelector && (
                                    <p className="text-red-500 text-xs mt-1">{errors.machineSelector.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Tipo de mantenimiento*
                                </label>
                                <Controller
                                    name="maintenanceType"
                                    control={control}
                                    rules={{ required: 'Debe seleccionar un tipo de mantenimiento' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            aria-label="Maintenance Type Select"
                                            className={`parametrization-input ${errors.maintenanceType ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seleccionar tipo de mantenimiento</option>
                                            {maintenanceTypes.map(type => (
                                                <option key={type.id_types} value={type.id_types}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.maintenanceType && (
                                    <p className="text-red-500 text-xs mt-1">{errors.maintenanceType.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Segunda fila: Schedule date, Schedule hour y Assigned technician */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Fecha programada*
                                </label>
                                <Controller
                                    name="scheduleDate"
                                    control={control}
                                    rules={{ 
                                        required: 'Debe ingresar una fecha',
                                        validate: (value) => {
                                            if (!value) return 'Debe ingresar una fecha';
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (selectedDate < today) {
                                                return 'La fecha debe ser igual o posterior a hoy';
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="date"
                                            aria-label="Schedule Date Input"
                                            className={`parametrization-input ${errors.scheduleDate ? 'border-red-500' : ''}`}
                                        />
                                    )}
                                />
                                {errors.scheduleDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.scheduleDate.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Hora programada*
                                </label>
                                <div className="flex gap-1">
                                    <Controller
                                        name="scheduleHour"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                aria-label="Schedule Hour Select"
                                                className="parametrization-input"
                                                style={{ flex: '1' }}
                                            >
                                                <option value="">--</option>
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const hour = (i + 1).toString().padStart(2, '0');
                                                    return (                                                        
                                                        <option key={hour} value={hour}>
                                                            {hour}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        )}
                                    />
                                    <Controller
                                        name="scheduleMinute"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="parametrization-input"
                                                style={{ flex: '1' }}
                                            >
                                                <option value="">--</option>
                                                {['00', '15', '30', '45'].map(minute => (
                                                    <option key={minute} value={minute}>
                                                        {minute}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    <Controller
                                        name="scheduleAMPM"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="parametrization-input"
                                                style={{ flex: '0.8' }}
                                            >
                                                <option value="">--</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Técnico asignado*
                                </label>
                                <Controller
                                    name="assignedTechnician"
                                    control={control}
                                    rules={{ required: 'Debe seleccionar un técnico' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            aria-label="Assigned Technician Select"
                                            className={`parametrization-input ${errors.assignedTechnician ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seleccionar técnico</option>
                                            {technicians.map(technician => (
                                                <option key={technician.id} value={technician.id}>
                                                    {technician.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.assignedTechnician && (
                                    <p className="text-red-500 text-xs mt-1">{errors.assignedTechnician.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Maintenance details */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Detalles de mantenimiento*
                            </label>
                            <Controller
                                name="maintenanceDetails"
                                control={control}
                                rules={{ 
                                    required: 'Debe ingresar los detalles del mantenimiento',
                                    maxLength: {
                                        value: 350,
                                        message: 'Los detalles no pueden exceder 350 caracteres'
                                    }
                                }}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        aria-label="Maintenance Details Textarea"
                                        className={`parametrization-input ${errors.maintenanceDetails ? 'border-red-500' : ''}`}
                                        rows="4"
                                        placeholder="Escribir comentarios..."
                                        style={{ minHeight: '100px' }}
                                    />
                                )}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    {errors.maintenanceDetails && (
                                        <p className="text-red-500 text-xs">{errors.maintenanceDetails.message}</p>
                                    )}
                                </div>
                                <p className="text-xs text-secondary">
                                    {watch('maintenanceDetails')?.length || 0}/350 caracteres
                                </p>
                            </div>
                        </div>

                        {/* Botón Schedule */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                aria-label="Schedule Maintenance Button"
                                className={`btn-theme btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{
                                    padding: '0.75rem 3rem',
                                    borderRadius: 'var(--border-radius-md)',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                {isSubmitting ? 'Programando...' : 'Programar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <SuccessModal 
                isOpen={successOpen} 
                onClose={() => {setSuccessOpen(false), onClose()}} 
                message={modalMessage || "Operación realizada con éxito."} 
            />
            <ErrorModal 
                isOpen={errorOpen} 
                onClose={() => setErrorOpen(false)} 
                message={modalMessage || "Ha ocurrido un error. Por favor, inténtelo de nuevo."} 
            />
        </div>
    );
};

export default ScheduleMaintenanceModal;