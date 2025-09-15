"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaArrowLeft, FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaShieldAlt, FaCheckCircle, FaClock, FaTimesCircle, FaEdit, FaEye, FaSave, FaUserPlus, FaExclamationTriangle, FaUserShield, FaTrash } from 'react-icons/fa';
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

  // Función para hacer las opciones de select desde los datos de configuración
  const getDocumentTypeOptions = React.useCallback(() => {
    return documentTypes.map(type => ({ value: type.id, label: type.name }));
  }, [documentTypes]);

  const getGenderTypeOptions = React.useCallback(() => {
    return genderTypes.map(type => ({ value: type.id, label: type.name }));
  }, [genderTypes]);

  const getRoleTypeOptions = React.useCallback(() => {
    return roleTypes.map(type => ({ value: type.id, label: type.name }));
  }, [roleTypes]);

  // Función para mapear el ID del tipo de documento a su nombre
  const getDocumentTypeName = React.useCallback((typeId) => {
    const documentTypeMap = {
      1: 'Cédula de Ciudadanía',
      2: 'Tarjeta de Identidad', 
      3: 'Cédula de Extranjería',
      4: 'Pasaporte',
      5: 'NIT'
    };
    
    return documentTypeMap[typeId] || 'Tipo desconocido';
  }, []);

  // Función para convertir fecha a formato de input (YYYY-MM-DD)
  const formatDateForInput = React.useCallback((dateString) => {
    if (!dateString) return '';
    
    let date;
    
    try {
      // Intentar diferentes formatos de fecha
      if (typeof dateString === 'string') {
        // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        // Si tiene formato ISO con tiempo, extraer solo la fecha
        else if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        // Si tiene formato DD/MM/YYYY, convertir
        else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateString.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        // Si tiene formato MM/DD/YYYY, convertir  
        else if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
        }
        // Para otros formatos, intentar crear una fecha
        else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Si llegamos aquí con una fecha válida, formatearla
      if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error formateando fecha para input:', error, 'Fecha original:', dateString);
      return '';
    }
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
        type_document_id: userData.type_document_id ? { 
          value: userData.type_document_id, 
          label: userData.type_document_name || getDocumentTypeName(userData.type_document_id)
        } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: userData.gender_id ? { value: userData.gender_id, label: userData.gender_name } : null,
        roles: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
      });
    }
  }, [userData, formatDateForInput, getDocumentTypeName]);

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

    let date;
    
    try {
      // Intentar diferentes formatos de fecha
      if (typeof dateString === 'string') {
        // Si la fecha ya está en formato ISO (YYYY-MM-DD), parsear directamente
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Formato YYYY-MM-DD
          const [year, month, day] = dateString.split('-');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (dateString.includes('T')) {
          // Formato ISO con tiempo
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
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', dateString);
      return 'Fecha inválida';
    }
  }, []);

  // FormField con soporte para selects
  const FormField = React.useCallback(({ label, value, onChange, icon, type = 'text', className = '', required = false, disabled = false, placeholder = '', options = [] }) => {
    const showError = required && !value && submitLoading;
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label className={`text-sm font-semibold mb-1 flex items-center gap-2 ${showError ? 'text-error' : 'text-primary'}`}>
          {icon && <span className="text-accent">{icon}</span>}
          {label} {required && <span className="text-error">*</span>}
        </label>
        {isEditing ? (
          type === 'select' ? (
            <Select
              value={value}
              onChange={onChange}
              options={options}
              isDisabled={disabled}
              placeholder={placeholder}
              className="text-primary"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: showError ? '#ef4444' : '#d1d5db',
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: showError ? '#ef4444' : '#9ca3af'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? 'var(--accent-color)' : state.isFocused ? 'var(--surface-color)' : 'white',
                  color: 'var(--primary-color)'
                })
              }}
            />
          ) : (
            <input
              type={type}
              value={value || ''}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full rounded-md border px-3 py-2 bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent ${showError ? 'border-error' : 'border-neutral-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          )
        ) : (
          <div className="w-full bg-neutral-100 rounded-md px-3 py-2 min-h-[40px] flex items-center">
            <span className="text-primary font-medium">
              {type === 'date' ? formatDate(value) :
                typeof value === 'object' && value !== null ? value.label || 'No disponible' :
                  value || 'No disponible'}
            </span>
          </div>
        )}
      </div>
    );
  }, [isEditing, formatDate, submitLoading]);

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
        type_document_id: userData.type_document_id ? { 
          value: userData.type_document_id, 
          label: userData.type_document_name || getDocumentTypeName(userData.type_document_id)
        } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: userData.gender_id ? { value: userData.gender_id, label: userData.gender_name } : null,
        roles: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
      });
    }
  }, [userData, formatDateForInput, getDocumentTypeName]);

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
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="sr-only">
            {isEditing ? 'Update User' : 'Detalles del Usuario'} - {getFullName()}
          </Dialog.Title>

          <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Update User' : 'Detalles del Usuario'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
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
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Primera fila: Tipo de documento, Número de documento, Género */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Identification type
                      </label>
                      {isEditing ? (
                        <Select
                          value={formData.type_document_id}
                          onChange={handleSelectChange('type_document_id')}
                          options={documentTypes.map(doc => ({ value: doc.id, label: doc.name }))}
                          placeholder="C.C"
                          className="text-sm"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '40px',
                              borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                              boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                              '&:hover': {
                                borderColor: '#9ca3af'
                              }
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                              color: state.isSelected ? 'white' : '#374151'
                            })
                          }}
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.type_document_name || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Identification number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.document_number || ''}
                          onChange={handleInputChange('document_number')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="10765000002"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.document_number || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      {isEditing ? (
                        <Select
                          value={formData.gender_id}
                          onChange={handleSelectChange('gender_id')}
                          options={genderTypes.map(gender => ({ value: gender.id, label: gender.name }))}
                          placeholder="Male"
                          className="text-sm"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '40px',
                              borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                              boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                              '&:hover': {
                                borderColor: '#9ca3af'
                              }
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                              color: state.isSelected ? 'white' : '#374151'
                            })
                          }}
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.gender_name || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Segunda fila: Fecha de expedición, Fecha de nacimiento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Expedition date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.date_issuance_document || ''}
                          onChange={handleInputChange('date_issuance_document')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {formatDate(userData.date_issuance_document)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Birth date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.birthday || ''}
                          onChange={handleInputChange('birthday')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {formatDate(userData.birthday)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tercera fila: Role y Add button */}
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-3 space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      {isEditing ? (
                        <Select
                          value={formData.role}
                          onChange={handleSelectChange('role')}
                          options={roleTypes.map(role => ({
                            value: role.role_id,
                            label: role.role_name,
                          }))}
                          placeholder="Employee"
                          className="text-sm"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '40px',
                              borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                              boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                              '&:hover': {
                                borderColor: '#9ca3af'
                              }
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                              color: state.isSelected ? 'white' : '#374151'
                            })
                          }}
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.roles && userData.roles.length > 0 ? userData.roles[0].name : 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div>
                        <button
                          type="button"
                          onClick={handleAddRole}
                          disabled={!formData.role}
                          className="w-full bg-black text-white rounded-md px-4 py-2 h-[40px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cuarta fila: Nombres y apellidos */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                        {isEditing && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={handleInputChange('name')}
                          className={`w-full border rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${!formData.name && submitLoading ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="example"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.name || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        First Last Name
                        {isEditing && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.first_last_name || ''}
                          onChange={handleInputChange('first_last_name')}
                          className={`w-full border rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${!formData.first_last_name && submitLoading ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Espinosa"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.first_last_name || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Second Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.second_last_name || ''}
                          onChange={handleInputChange('second_last_name')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Segundo apellido"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.second_last_name || 'No disponible'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected roles */}
                  {formData.roles && formData.roles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Selected roles</h3>
                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {formData.roles.map((role, index) => (
                            <div key={index} className="flex items-center justify-between bg-white px-3 py-1 rounded border">
                              <span className="text-sm text-gray-900">
                                {role.label}
                              </span>
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRole(role)}
                                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <FaTrash size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información adicional en modo vista */}
                  {!isEditing && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
                      
                      {/* Información de contacto */}
                      <div className="grid grid-cols-2 gap-4">


                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Primer Login Completado</label>
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 h-[40px] flex items-center">
                          <span className="text-gray-900 text-sm">
                            {userData.first_login_complete ? 'Sí' : 'Pendiente'}
                          </span>
                        </div>
                      </div>



                      {/* Sección de Cambio de Estado */}
                      {userData && getAvailableStatuses().length > 0 && (
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaShieldAlt className="text-blue-600" />
                            Cambiar Estado del Usuario
                          </h4>
                          <div className="flex items-center gap-4">
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
                                  control: (base, state) => ({
                                    ...base,
                                    minHeight: '40px',
                                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                                    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                                    '&:hover': {
                                      borderColor: '#9ca3af'
                                    }
                                  }),
                                  option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                                    color: state.isSelected ? 'white' : '#374151'
                                  })
                                }}
                              />
                              {statusChangeLoading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>


                      {/* Foto de Perfil */}
                      {userData.profile_picture && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Foto de Perfil</h4>
                          <div className="flex justify-center">
                            <img
                              src={userData.profile_picture}
                              alt="Foto de perfil"
                              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensaje de validación */}
                  {isEditing && !isFormValid && submitLoading && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                      <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                      <span>Please complete all required fields before submitting the form.</span>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isFormValid || submitLoading}
                        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <FaEdit />
                        Edit User
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
