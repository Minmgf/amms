"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaArrowLeft, FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaShieldAlt, FaCheckCircle, FaClock, FaTimesCircle, FaEdit, FaEye, FaSave, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import Select from 'react-select';
import { getDocumentTypes, getGenderTypes, getRoleTypes, editUser, changeUserStatus } from '../../../services/authService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';

// Función helper para obtener el token desde localStorage o sessionStorage
const getAuthToken = () => {
  // Primero intentar localStorage
  let token = localStorage.getItem('token');
  
  // Si no está en localStorage, intentar sessionStorage
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  return token;
};

export default function UserDetailsModal({ isOpen, onClose, userData, onUserUpdated }) {
  useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  // Estados para los modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  
  // Estados para el modal interno de cambio de estado
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeMessage, setStatusChangeMessage] = useState('');
  const [statusChangeSuccess, setStatusChangeSuccess] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState(false);

  // Estados para los datos de configuración
  const [documentTypes, setDocumentTypes] = useState([]);
  const [genderTypes, setGenderTypes] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);

  // Estados disponibles para el usuario
  const userStatuses = [
    { value: 1, label: 'Activo', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 2, label: 'Inactivo', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 3, label: 'Suspendido', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  ];

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    first_last_name: '',
    second_last_name: '',
    type_document_id: null,
    document_number: '',
    date_issuance_document: '',
    birthday: '',
    gender_id: null,
    roles: []
  });

  // Optimizar las funciones de manejo de cambios - MOVER AQUÍ TODOS LOS useCallback
  const handleInputChange = React.useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectChange = React.useCallback((field) => (option) => {
    setFormData(prev => ({ ...prev, [field]: option }));
  }, []);

  const handleAddRole = React.useCallback(() => {
    if (formData.role && !formData.roles.some(r => r.value === formData.role.value)) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, prev.role],
        role: null
      }));
    }
  }, [formData.role, formData.roles]);

  const handleRemoveRole = React.useCallback((roleToRemove) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.value !== roleToRemove.value)
    }));
  }, []);

  // Función para convertir fecha a formato de input (YYYY-MM-DD)
  const formatDateForInput = React.useCallback((dateString) => {
    if (!dateString) return '';
    
    let date;
    
    // Intentar diferentes formatos de fecha
    if (typeof dateString === 'string') {
      // Si la fecha ya está en formato ISO (YYYY-MM-DD), extraer solo la parte de la fecha
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        // Formato DD/MM/YYYY o MM/DD/YYYY
        date = new Date(dateString);
      } else {
        // Otros formatos
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const handleEdit = React.useCallback((e) => {
    e.preventDefault(); // Prevenir el envío del formulario
    e.stopPropagation(); // Detener la propagación del evento
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  }, []);

  const handleCancel = React.useCallback((e) => {
    e.preventDefault(); // Prevenir el envío del formulario
    e.stopPropagation(); // Detener la propagación del evento
    setIsEditing(false);
    setError(null);
    setSuccess(false);
    // Restaurar datos originales
    if (userData) {
      const formattedBirthday = formatDateForInput(userData.birthday);
      const formattedIssuanceDate = formatDateForInput(userData.date_issuance_document);
      
      setFormData({
        name: userData.name || '',
        first_last_name: userData.first_last_name || '',
        second_last_name: userData.second_last_name || '',
        type_document_id: userData.type_document_id ? { value: userData.type_document_id, label: userData.type_document_name } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: userData.gender_id ? { value: userData.gender_id, label: userData.gender_name } : null,
        roles: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
      });
    }
  }, [userData, formatDateForInput]);

  // Función para manejar el cambio de estado del usuario
  const handleStatusChange = React.useCallback(async (newStatus) => {
    // Mostrar modal de confirmación interno
    setPendingStatusChange(newStatus);
    setStatusChangeMessage(`¿Está seguro que desea cambiar el estado del usuario?`);
    setShowStatusChangeModal(true);
  }, []);

  // Función para confirmar el cambio de estado
  const confirmStatusChange = React.useCallback(async () => {
    console.log('confirmStatusChange ejecutándose...');
    console.log('pendingStatusChange:', pendingStatusChange);
    console.log('userData.id:', userData?.id);
    
    if (!pendingStatusChange) {
      console.log('No hay pendingStatusChange, saliendo...');
      return;
    }
    
    try {
      setStatusChangeLoading(true);
      setShowStatusChangeModal(false);

      console.log('Llamando a changeUserStatus...');
      const response = await changeUserStatus(userData.id, pendingStatusChange);
      console.log('Respuesta de changeUserStatus:', response);

      if (response.success) {
        setStatusChangeSuccess(true);
        setStatusChangeMessage('Estado del usuario cambiado exitosamente');
        setPendingStatusChange(null);
        // Cerrar el modal principal y actualizar la lista
        if (onUserUpdated) {
          onUserUpdated();
        }
        onClose();
      } else {
        setStatusChangeError(true);
        setStatusChangeMessage(response.message || 'Error al cambiar el estado del usuario');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      let errorMessage = 'Error al cambiar estado del usuario';
      
      if (err.message === 'No hay token disponible') {
        errorMessage = 'Error de autenticación: No hay token disponible. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token expirado') {
        errorMessage = 'Error de autenticación: Token expirado. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token no válido') {
        errorMessage = 'Error de autenticación: Token no válido. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Error de autenticación: Credenciales inválidas. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.data?.message) {
        errorMessage = 'Error al cambiar estado: ' + err.response.data.message;
      } else if (err.response?.data?.detail) {
        errorMessage = 'Error al cambiar estado: ' + err.response.data.detail;
      } else {
        errorMessage = 'Error al cambiar estado: ' + err.message;
      }
      
      setStatusChangeError(true);
      setStatusChangeMessage(errorMessage);
    } finally {
      setStatusChangeLoading(false);
      setPendingStatusChange(null);
    }
  }, [pendingStatusChange, userData?.id, onUserUpdated, onClose]);

  // Funciones para manejar los modales
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setIsEditing(false);
    onClose(); // Cerrar el modal principal cuando se cierra el de éxito
    if (onUserUpdated) {
      onUserUpdated();
    }
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    setPendingStatusChange(null);
  };

  // Funciones para manejar los modales internos de cambio de estado
  const handleStatusChangeModalClose = () => {
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };

  const handleStatusChangeSuccessClose = () => {
    setStatusChangeSuccess(false);
    setStatusChangeMessage('');
  };

  const handleStatusChangeErrorClose = () => {
    setStatusChangeError(false);
    setStatusChangeMessage('');
  };

  // Función para formatear fechas
  const formatDate = React.useCallback((dateString) => {
    if (!dateString) return 'No disponible';

    const date = new Date(dateString + 'T00:00:00');

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Mover FormField fuera del render para evitar recreaciones
  const FormField = React.useCallback(({ label, value, onChange, icon, type = 'text', className = '', required = false, disabled = false }) => (
    <div className={`form-field ${className}`}>
      <label className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
        {icon && <span className="text-accent">{icon}</span>}
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative">
        {isEditing ? (
          <input
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`input-theme ${required && !value ? 'border-error' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        ) : (
          <div className="w-full card-secondary">
            <span className="text-primary font-medium">
              {type === 'date' ? formatDate(value) :
                typeof value === 'object' && value !== null ? value.label || 'No disponible' :
                  value || 'No disponible'}
            </span>
          </div>
        )}
      </div>
    </div>
  ), [isEditing, formatDate]);

  const FormSection = React.useCallback(({ title, icon, children, className = '' }) => (
    <div className={`card-theme ${className}`}>
      <div className="px-6 py-4 border-b border-primary bg-surface rounded-t-lg">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  ), []);

  // Cargar datos de configuración cuando se abre el modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [docTypesResponse, genderTypesResponse, roleTypesResponse] = await Promise.all([
          getDocumentTypes(),
          getGenderTypes(),
          getRoleTypes()
        ]);

        if (docTypesResponse.success && genderTypesResponse.success && roleTypesResponse.success) {
          setDocumentTypes(docTypesResponse.data);
          setGenderTypes(genderTypesResponse.data);
          setRoleTypes(roleTypesResponse.data);
        } else {
          setError('Error al cargar los datos de configuración');
        }
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Inicializar formulario con datos del usuario
  useEffect(() => {
    if (userData) {
      const formattedBirthday = formatDateForInput(userData.birthday);
      const formattedIssuanceDate = formatDateForInput(userData.date_issuance_document);

      setFormData({
        name: userData.name || '',
        first_last_name: userData.first_last_name || '',
        second_last_name: userData.second_last_name || '',
        type_document_id: userData.type_document_id ? { value: userData.type_document_id, label: userData.type_document_name } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: userData.gender_id ? { value: userData.gender_id, label: userData.gender_name } : null,
        roles: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
      });
    }
  }, [userData, formatDateForInput]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setError(null);
      setSuccess(false);
      setShowSuccessModal(false);
      setShowErrorModal(false);
      setShowConfirmModal(false);
      setModalMessage('');
      setPendingStatusChange(null);
      setShowStatusChangeModal(false);
      setStatusChangeMessage('');
      setStatusChangeSuccess(false);
      setStatusChangeError(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      setSubmitLoading(true);
      setError(null);

      // Preparar los datos en el formato correcto
      const userDataToSend = {
        name: formData.name,
        first_last_name: formData.first_last_name,
        second_last_name: formData.second_last_name,
        type_document_id: formData.type_document_id?.value || formData.type_document_id,
        document_number: String(formData.document_number), // Convertir a string
        date_issuance_document: formData.date_issuance_document,
        birthday: formData.birthday,
        gender_id: formData.gender_id?.value || formData.gender_id,
        roles: formData.roles.map(role => role.value || role)
      };

      console.log('Datos a enviar:', userDataToSend);
      console.log('Token actual:', getAuthToken());

      const response = await editUser(userData.id, userDataToSend);

      if (response.success) {
        setSuccess(true);
        setModalMessage('Usuario actualizado exitosamente');
        setShowSuccessModal(true);
        // El modal se encargará de cerrar la edición
      } else {
        setError(response.message || 'Error al actualizar el usuario');
        setModalMessage(response.message || 'Error al actualizar el usuario');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Error completo:', err);
      let errorMessage = 'Error al actualizar el usuario';
      
      if (err.message === 'No hay token disponible') {
        errorMessage = 'Error de autenticación: No hay token disponible. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token expirado') {
        errorMessage = 'Error de autenticación: Token expirado. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token no válido') {
        errorMessage = 'Error de autenticación: Token no válido. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Error de autenticación: Credenciales inválidas. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.data?.message) {
        errorMessage = 'Error al actualizar el usuario: ' + err.response.data.message;
      } else if (err.response?.data?.detail) {
        errorMessage = 'Error al actualizar el usuario: ' + err.response.data.detail;
      } else {
        errorMessage = 'Error al actualizar el usuario: ' + err.message;
      }
      
      setError(errorMessage);
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormValid = formData.name &&
    formData.first_last_name &&
    formData.document_number &&
    formData.type_document_id &&
    formData.gender_id;

  if (!userData) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Activo':
        return <FaCheckCircle className="text-success" />;
      case 'Pendiente':
        return <FaClock className="text-warning" />;
      case 'Inactivo':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'parametrization-badge-1';
      case 'Pendiente':
        return 'parametrization-badge-3';
      case 'Inactivo':
        return 'parametrization-badge-6';
      default:
        return 'parametrization-badge-5';
    }
  };

  const getFullName = () => {
    const parts = [userData.name, userData.first_last_name, userData.second_last_name];
    return parts.filter(Boolean).join(' ');
  };

  // Función para obtener el estado actual del usuario
  const getCurrentUserStatus = () => {
    if (!userData) return null;
    
    // Mapear el nombre del estado al valor numérico
    const statusMap = {
      'Activo': 1,
      'Inactivo': 2,
      'Suspendido': 3
    };
    
    return statusMap[userData.status_name] || null;
  };

  // Función para obtener las opciones de estado disponibles (excluyendo el actual)
  const getAvailableStatuses = () => {
    const currentStatus = getCurrentUserStatus();
    return userStatuses.filter(status => status.value !== currentStatus);
  };

  // Modal de confirmación interno para cambio de estado usando Dialog de Radix
  const StatusChangeConfirmModal = ({ isOpen, onClose, onConfirm, message, isLoading }) => {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[70] w-full max-w-md">
            <div className="p-6 card-theme text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <FaExclamationTriangle className="w-8 h-8 text-warning" />
              </div>

              <Dialog.Title className="text-lg font-semibold text-primary mb-2">
                Confirmar Cambio de Estado
              </Dialog.Title>

              <Dialog.Description className="text-secondary text-sm mb-6">
                {message}
              </Dialog.Description>

              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button
                    disabled={isLoading}
                    className="btn-theme btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="btn-theme btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  };

  return (
    <>
      {/* Modal de confirmación interno para cambio de estado - FUERA del Dialog.Root */}
      <StatusChangeConfirmModal
        isOpen={showStatusChangeModal}
        onClose={handleStatusChangeModalClose}
        onConfirm={confirmStatusChange}
        message={statusChangeMessage}
        isLoading={statusChangeLoading}
      />
      
      {/* Modal de éxito para cambio de estado */}
      <Dialog.Root open={statusChangeSuccess} onOpenChange={handleStatusChangeSuccessClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[70] w-full max-w-md">
            <div className="p-6 text-center card-theme">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="w-8 h-8 text-success" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-primary mb-2">¡Éxito!</Dialog.Title>
              <Dialog.Description className="text-secondary text-sm mb-6">{statusChangeMessage}</Dialog.Description>
              <Dialog.Close asChild>
                <button className="btn-theme btn-success w-full">
                  Continuar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {/* Modal de error para cambio de estado */}
      <Dialog.Root open={statusChangeError} onOpenChange={handleStatusChangeErrorClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[70] w-full max-w-md">
            <div className="p-6 text-center card-theme">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTimesCircle className="w-8 h-8 text-error" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-primary mb-2">Error</Dialog.Title>
              <Dialog.Description className="text-secondary text-sm mb-6">{statusChangeMessage}</Dialog.Description>
              <Dialog.Close asChild>
                <button className="btn-theme btn-error w-full">
                  Cerrar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="sr-only">
            {isEditing ? 'Editar Usuario' : 'Detalles del Usuario'} - {getFullName()}
          </Dialog.Title>

          <div className="p-6 card-theme">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 card-secondary p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 btn-theme btn-secondary"
                >
                  <FaArrowLeft className="text-primary" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-accent text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-primary">
                      {isEditing ? 'Editar Usuario' : 'Detalles del Usuario'}
                    </h2>
                    <p className="text-sm text-secondary">
                      {isEditing ? 'Modifique la información del usuario' : 'Información completa del usuario'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado del usuario en el header */}
              <div className="flex items-center gap-2">
                {getStatusIcon(userData.status_name)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userData.status_name)}`}>
                  {userData.status_name}
                </span>
              </div>
            </div>

            {/* Loading inicial */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="mt-4 text-secondary">Cargando configuración...</p>
              </div>
            )}

            {/* Error */}
            {/* Remover error visual ya que usamos ErrorModal */}

            {/* Success */}
            {/* Remover success visual ya que usamos SuccessModal */}

            {/* Formulario */}
            {!loading && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Izquierda */}
                  <div className="space-y-6">
                    {/* Información Personal */}
                    <FormSection title="Información Personal" icon={<FaUser />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Nombre"
                          value={formData.name}
                          onChange={handleInputChange('name')}
                          icon={<FaUser />}
                          required={true}
                          disabled={!isEditing}
                        />
                        <FormField
                          label="Primer Apellido"
                          value={formData.first_last_name}
                          onChange={handleInputChange('first_last_name')}
                          required={true}
                          disabled={!isEditing}
                        />
                        <FormField
                          label="Segundo Apellido"
                          value={formData.second_last_name}
                          onChange={handleInputChange('second_last_name')}
                          disabled={!isEditing}
                        />
                        {isEditing ? (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FaVenusMars className="text-blue-600" />
                              Género *
                            </label>
                            <Select
                              value={formData.gender_id}
                              onChange={handleSelectChange('gender_id')}
                              options={genderTypes.map(gender => ({ value: gender.id, label: gender.name }))}
                              placeholder="Seleccionar género"
                              className={`${!formData.gender_id ? 'border-red-500' : ''}`}
                              isSearchable
                              isClearable
                            />
                          </div>
                        ) : (
                          <FormField
                            label="Género"
                            value={formData.gender_id}
                            icon={<FaVenusMars />}
                            disabled={true}
                          />
                        )}
                        <FormField
                          label="Fecha de Nacimiento"
                          value={formData.birthday}
                          onChange={handleInputChange('birthday')}
                          type="date"
                          icon={<FaCalendarAlt />}
                          className="md:col-span-2"
                          disabled={!isEditing}
                        />
                      </div>

                      {userData.status_description && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{userData.status_description}</p>
                        </div>
                      )}
                    </FormSection>

                    {/* Información de Contacto */}
                    <FormSection title="Información de Contacto" icon={<FaEnvelope />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Email"
                          value={userData.email}
                          icon={<FaEnvelope />}
                          className="md:col-span-2"
                          disabled={true}
                        />
                        <FormField
                          label="Teléfono"
                          value={userData.phone}
                          icon={<FaPhone />}
                          disabled={true}
                        />
                        <FormField
                          label="Dirección"
                          value={userData.address}
                          icon={<FaMapMarkerAlt />}
                          className="md:col-span-2"
                          disabled={true}
                        />
                      </div>
                    </FormSection>
                  </div>

                  {/* Columna Derecha */}
                  <div className="space-y-6">
                    {/* Información de Documento */}
                    <FormSection title="Información de Documento" icon={<FaIdCard />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing ? (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FaIdCard className="text-blue-600" />
                              Tipo de Documento *
                            </label>
                            <Select
                              value={formData.type_document_id}
                              onChange={handleSelectChange('type_document_id')}
                              options={documentTypes.map(doc => ({ value: doc.id, label: doc.name }))}
                              placeholder="Seleccionar tipo de documento"
                              className={`${!formData.type_document_id ? 'border-red-500' : ''}`}
                              isSearchable
                              isClearable
                            />
                          </div>
                        ) : (
                          <FormField
                            label="Tipo de Documento"
                            value={userData.type_document_name}
                            icon={<FaIdCard />}
                          />
                        )}
                        <FormField
                          label="Número de Documento"
                          value={formData.document_number}
                          onChange={handleInputChange('document_number')}
                          required={true}
                          disabled={!isEditing}
                          className="md:col-span-2"
                        />
                        <FormField
                          label="Fecha de Expedición"
                          value={formData.date_issuance_document}
                          onChange={handleInputChange('date_issuance_document')}
                          type="date"
                          icon={<FaCalendarAlt />}
                          className="md:col-span-2"
                          disabled={!isEditing}
                        />
                      </div>
                    </FormSection>

                    {/* Roles y Permisos */}
                    <FormSection title="Roles y Permisos" icon={<FaShieldAlt />}>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaShieldAlt className="text-blue-600" />
                            Roles Asignados
                          </label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Select
                                    value={formData.role}
                                    onChange={handleSelectChange('role')}
                                    options={roleTypes.map(role => ({
                                      value: role.role_id,
                                      label: role.role_name,
                                    }))}
                                    placeholder="Seleccionar rol"
                                    isSearchable
                                    isClearable
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddRole}
                                  disabled={!formData.role}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaUserPlus size={14} />
                                </button>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-3 min-h-[60px]">
                                {formData.roles.length === 0 ? (
                                  <p className="text-gray-500 text-sm">
                                    No se han agregado roles. Seleccione un rol del dropdown y haga clic en agregar.
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {formData.roles.map((role, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm flex items-center gap-2"
                                      >
                                        {role.label}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRole(role)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {userData.roles && userData.roles.length > 0 ? (
                                userData.roles.map((role, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                                  >
                                    {role.name}
                                  </span>
                                ))
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                  <span className="text-gray-500 text-sm">Sin roles asignados</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Primer Login Completado"
                            value={userData.first_login_complete ? 'Sí' : 'Pendiente'}
                            icon={userData.first_login_complete ? <FaCheckCircle /> : <FaClock />}
                            disabled={true}
                          />
                          <FormField
                            label="ID de Usuario"
                            value={userData.id}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </FormSection>

                    {/* Foto de Perfil */}
                    {userData.profile_picture && (
                      <FormSection title="Foto de Perfil">
                        <div className="flex justify-center">
                          <div className="relative">
                            <img
                              src={userData.profile_picture}
                              alt="Foto de perfil"
                              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                            />
                          </div>
                        </div>
                      </FormSection>
                    )}
                  </div>
                </div>

                {/* Mensaje de validación */}
                {isEditing && !isFormValid && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <FaExclamationTriangle />
                    Por favor complete todos los campos requeridos antes de enviar el formulario.
                  </div>
                )}

                {/* Sección de Cambio de Estado */}
                {!isEditing && userData && getAvailableStatuses().length > 0 && (
                  <div className="card-secondary rounded-lg p-6 shadow-sm border border-primary">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaShieldAlt className="text-blue-600" />
                      Cambiar Estado del Usuario
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userData.status_name)}`}>
                          {userData.status_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Cambiar a:</span>
                        <Select
                          placeholder="Seleccionar nuevo estado"
                          options={getAvailableStatuses()}
                          onChange={(selectedOption) => {
                            if (selectedOption && !statusChangeLoading) {
                              handleStatusChange(selectedOption.value);
                            }
                          }}
                          isDisabled={statusChangeLoading}
                          className="min-w-[200px]"
                          isSearchable={false}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '40px',
                            }),
                          }}
                        />
                        {statusChangeLoading && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-6 mt-6 card-secondary rounded-lg p-4 shadow-sm border border-primary">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-theme btn-secondary px-6 py-2 flex items-center gap-2"
                      >
                        <FaArrowLeft />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!isFormValid || submitLoading}
                        className="btn-theme btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-theme btn-secondary px-6 py-2 flex items-center gap-2"
                      >
                        <FaArrowLeft />
                        Cerrar
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="btn-theme btn-primary px-6 py-2 flex items-center gap-2"
                      >
                        <FaEdit />
                        Editar Usuario
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      
      {/* Modales de Success, Error y Confirmación */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Operación Exitosa"
        message={modalMessage}
      />
      
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Error"
        message={modalMessage}
      />
      
    </Dialog.Root>
    </>
  );
}
