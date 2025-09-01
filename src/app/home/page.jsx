"use client";
import React from 'react'
import UserTable from '../components/UserTable'

const HomePage = ({ activeMenu = "Home" }) => {

    

    // Componentes para cada sección del menú
    const HomeContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Bienvenido al Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Resumen General</h3>
                    <p className="text-gray-600">Vista general de las métricas principales del sistema.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Actividad Reciente</h3>
                    <p className="text-gray-600">Últimas actividades y notificaciones del sistema.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Accesos Rápidos</h3>
                    <p className="text-gray-600">Enlaces directos a las funciones más utilizadas.</p>
                </div>
            </div>
        </div>
    );

    const MachineryContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Maquinaria</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Inventario de Equipos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-medium">Equipos Activos</h4>
                        <p className="text-2xl font-bold text-green-600">24</p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-medium">En Mantenimiento</h4>
                        <p className="text-2xl font-bold text-yellow-600">3</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const MaintenanceContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Mantenimiento</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Programación de Mantenimiento</h3>
                    <p className="text-gray-600 mb-4">Gestiona el calendario de mantenimiento preventivo.</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Ver Calendario
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Solicitudes de Mantenimiento</h3>
                    <p className="text-gray-600 mb-4">Revisa y gestiona las solicitudes pendientes.</p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Ver Solicitudes
                    </button>
                </div>
            </div>
        </div>
    );

    const PayrollContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Nómina</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Reportes</h3>
                    <p className="text-gray-600 mb-4">Genera reportes de nómina y análisis.</p>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                        Generar Reporte
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Novedades</h3>
                    <p className="text-gray-600 mb-4">Gestiona novedades y ajustes de nómina.</p>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                        Gestionar
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Nóminas</h3>
                    <p className="text-gray-600 mb-4">Accede al historial de nóminas procesadas.</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Ver Historial
                    </button>
                </div>
            </div>
        </div>
    );

    const RequestsContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Solicitudes</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Gestión de Clientes</h3>
                    <p className="text-gray-600 mb-4">Administra la información de clientes y sus solicitudes.</p>
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                        Gestionar Clientes
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Gestión de Servicios</h3>
                    <p className="text-gray-600 mb-4">Controla los servicios y solicitudes de mantenimiento.</p>
                    <button className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600">
                        Gestionar Servicios
                    </button>
                </div>
            </div>
        </div>
    );

    const UserManagementContent = () => (
        <UserTable />
    );

    const MonitoringContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Monitoreo</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Gestión de Dispositivos</h3>
                    <p className="text-gray-600 mb-4">Monitorea y gestiona dispositivos conectados.</p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Ver Dispositivos
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Configuración de Umbrales</h3>
                    <p className="text-gray-600 mb-4">Define alertas y umbrales de monitoreo.</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Configurar Alertas
                    </button>
                </div>
            </div>
        </div>
    );

    const ParameterizationContent = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Parametrización</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Configuración del Sistema</h3>
                <p className="text-gray-600 mb-4">Gestiona los parámetros y configuraciones generales del sistema.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                        Configuración General
                    </button>
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                        Parámetros Avanzados
                    </button>
                </div>
            </div>
        </div>
    );

    // Función para renderizar el contenido basado en el menú activo
    const renderContent = () => {
        switch (activeMenu) {
            case "Home":
                return <HomeContent />;
            case "Machinery":
                return <MachineryContent />;
            case "Maintenance":
                return <MaintenanceContent />;
            case "Schedule Maintenance":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Programación de Mantenimiento</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Calendario de Mantenimiento</h3>
                            <p className="text-gray-600 mb-4">Gestiona el calendario de mantenimiento preventivo y programado.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Ver Calendario
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Crear Programación
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Maintenance Requests":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Mantenimiento</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Gestión de Solicitudes</h3>
                            <p className="text-gray-600 mb-4">Revisa y gestiona las solicitudes de mantenimiento pendientes.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                                    Solicitudes Pendientes
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Crear Solicitud
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Historial
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Payroll":
                return <PayrollContent />;
            case "Reports":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Reportes de Nómina</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Generación de Reportes</h3>
                            <p className="text-gray-600 mb-4">Genera reportes detallados de nómina y análisis.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                                    Reporte Mensual
                                </button>
                                <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                                    Reporte Anual
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Novelty":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Novedades</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Novedades de Nómina</h3>
                            <p className="text-gray-600 mb-4">Gestiona novedades y ajustes de nómina para empleados.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                                    Crear Novedad
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Ver Novedades
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Payrolls":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Historial de Nóminas</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Nóminas Procesadas</h3>
                            <p className="text-gray-600 mb-4">Accede al historial completo de nóminas procesadas.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Ver Historial
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Descargar Reportes
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Requests":
                return <RequestsContent />;
            case "User Management":
                return <UserManagementContent />;
            case "Clients":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Administración de Clientes</h3>
                            <p className="text-gray-600 mb-4">Administra la información de clientes y sus solicitudes.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                                    Ver Clientes
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Agregar Cliente
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Service Managements":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Servicios</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Control de Servicios</h3>
                            <p className="text-gray-600 mb-4">Controla los servicios y solicitudes de mantenimiento.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600">
                                    Ver Servicios
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Crear Servicio
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "User Management":
                return <UserManagementContent />;
            case "Role Management":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Administración de Roles</h3>
                            <p className="text-gray-600 mb-4">Define y gestiona roles de usuario en el sistema.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                                    Ver Roles
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Crear Rol
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Audit Log":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Registro de Auditoría</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Historial de Actividades</h3>
                            <p className="text-gray-600 mb-4">Revisa el historial completo de actividades del sistema.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                                    Ver Registros
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Exportar Log
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Permission Management":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Permisos</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Configuración de Permisos</h3>
                            <p className="text-gray-600 mb-4">Configura permisos específicos para usuarios y roles.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                                    Ver Permisos
                                </button>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Configurar
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Monitoring":
                return <MonitoringContent />;
            case "Devices Management":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Dispositivos</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Monitoreo de Dispositivos</h3>
                            <p className="text-gray-600 mb-4">Monitorea y gestiona dispositivos conectados al sistema.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    Ver Dispositivos
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Agregar Dispositivo
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Threshold":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Configuración de Umbrales</h1>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Alertas y Umbrales</h3>
                            <p className="text-gray-600 mb-4">Define alertas y umbrales de monitoreo para el sistema.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Configurar Alertas
                                </button>
                                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                                    Ver Umbrales
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "Parameterization":
                return <ParameterizationContent />;
            default:
                return <HomeContent />;
        }
    };

    return (
        <div className="mt-8 p-2">
            {renderContent()}
        </div>
    );
};

export default HomePage;
