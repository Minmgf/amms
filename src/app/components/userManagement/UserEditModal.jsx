"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaArrowLeft, FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaShieldAlt, FaCheckCircle, FaClock, FaTimesCircle, FaEdit, FaEye, FaSave, FaUserPlus, FaExclamationTriangle, FaUserShield, FaTrash } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import Select from 'react-select';
import { getDocumentTypes, getGenderTypes, getRoleTypes, editUser, changeUserStatus } from '../../../services/authService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';
import PermissionGuard from '@/app/(auth)/PermissionGuard';


export default function UserEditModal({ isOpen, onClose, userData, onUserUpdated }) {
  useTheme();
  const [isEditing, setIsEditing] = useState(true); // Comenzar en modo edición
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

  // Optimizar las funciones de manejo de cambios
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
    const options = documentTypes.map(type => ({ value: type.id, label: type.name }));
    return options;
  }, [documentTypes]);

  const getGenderTypeOptions = React.useCallback(() => {
    const options = genderTypes.map(type => ({ value: type.id, label: type.name }));
    return options;
  }, [genderTypes]);

  const getRoleTypeOptions = React.useCallback(() => {
    return roleTypes.map(type => ({ value: type.role_id, label: type.role_name }));
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
    if (userData && documentTypes.length > 0 && genderTypes.length > 0) {
      const formattedBirthday = formatDateForInput(userData.birthday);
      const formattedIssuanceDate = formatDateForInput(userData.date_issuance_document);
      
      // Mapear correctamente los IDs desde los datos del usuario
      const documentTypeId = userData.type_document_id || userData.type_document;
      const genderId = userData.gender_id || userData.gender;

      // Buscar las opciones correspondientes en los arrays cargados
      const documentTypeOption = documentTypes.find(type => type.id === documentTypeId);
      const genderOption = genderTypes.find(type => type.id === genderId);
      
      setFormData({
        name: userData.name || '',
        first_last_name: userData.first_last_name || '',
        second_last_name: userData.second_last_name || '',
        type_document_id: documentTypeOption ? { 
          value: documentTypeOption.id, 
          label: documentTypeOption.name
        } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: genderOption ? { 
          value: genderOption.id, 
          label: genderOption.name 
        } : null,
        roles: userData.roles ? userData.roles.map(role => ({ 
          value: role.role_id || role.id, 
          label: role.role_name || role.name 
        })) : []
      });
    }
  }, [userData, formatDateForInput, documentTypes, genderTypes]);

  // Funciones para manejar los modales
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setIsEditing(true);
    
    // Recargar datos antes de cerrar el modal
    if (onUserUpdated) {
      onUserUpdated();
    }
    
    // Cerrar el modal principal
    onClose();
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
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
    if (userData && documentTypes.length > 0 && genderTypes.length > 0) {
      const formattedBirthday = formatDateForInput(userData.birthday);
      const formattedIssuanceDate = formatDateForInput(userData.date_issuance_document);


      // Mapear correctamente los IDs desde los datos del usuario
      const documentTypeId = userData.type_document_id || userData.type_document;
      const genderId = userData.gender_id || userData.gender;

      // Buscar las opciones correspondientes en los arrays cargados
      const documentTypeOption = documentTypes.find(type => type.id === documentTypeId);
      const genderOption = genderTypes.find(type => type.id === genderId);


      setFormData({
        name: userData.name || '',
        first_last_name: userData.first_last_name || '',
        second_last_name: userData.second_last_name || '',
        type_document_id: documentTypeOption ? { 
          value: documentTypeOption.id, 
          label: documentTypeOption.name
        } : null,
        document_number: userData.document_number || '',
        date_issuance_document: formattedIssuanceDate,
        birthday: formattedBirthday,
        gender_id: genderOption ? { 
          value: genderOption.id, 
          label: genderOption.name 
        } : null,
        roles: userData.roles ? userData.roles.map(role => ({ 
          value: role.role_id || role.id, 
          label: role.role_name || role.name 
        })) : []
      });
    }
  }, [userData, formatDateForInput, documentTypes, genderTypes]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(true); // Comenzar en modo edición cuando se abra de nuevo
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

      const response = await editUser(userData.id, userDataToSend);

      if (response.success) {
        setSuccess(true);
        setModalMessage('Usuario actualizado exitosamente');
        setShowSuccessModal(true);
        
        // Recargar datos inmediatamente después del éxito
        if (onUserUpdated) {
          onUserUpdated();
        }
        
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

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 card-theme rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <Dialog.Title className="text-2xl font-bold text-primary">Editar Usuario</Dialog.Title>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                  <p className="mt-4 text-secondary">Cargando configuración...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <FormField
                      label="Tipo de identificación"
                      value={formData.type_document_id}
                      onChange={handleSelectChange('type_document_id')}
                      type="select"
                      options={getDocumentTypeOptions()}
                      required
                      disabled={!isEditing}
                      placeholder="Selecciona tipo de identificación"
                    />
                    <FormField
                      label="Número de identificación"
                      value={formData.document_number}
                      onChange={handleInputChange('document_number')}
                      required
                      disabled={!isEditing}
                    />
                    <FormField
                      label="Gender"
                      value={formData.gender_id}
                      onChange={handleSelectChange('gender_id')}
                      type="select"
                      options={getGenderTypeOptions()}
                      required
                      disabled={!isEditing}
                      placeholder="Selecciona género"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <FormField
                      label="Fecha de expedición"
                      value={formData.date_issuance_document}
                      onChange={handleInputChange('date_issuance_document')}
                      type="date"
                      disabled={!isEditing}
                    />
                    <FormField
                      label="Fecha de nacimiento"
                      value={formData.birthday}
                      onChange={handleInputChange('birthday')}
                      type="date"
                      disabled={!isEditing}
                    />
                    <PermissionGuard permission={7}>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <FormField
                            label="Rol"
                            value={formData.role}
                            onChange={handleSelectChange('role')}
                            type="select"
                            options={getRoleTypeOptions()}
                            disabled={!isEditing}
                            placeholder="Selecciona rol"
                          />
                        </div>
                        <button
                          type="button"
                          className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-accent disabled:opacity-50"
                          onClick={handleAddRole}
                          disabled={!isEditing || !formData.role}
                        >
                          Agregar
                        </button>
                      </div>
                    </PermissionGuard>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField
                      label="Nombre"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      required
                      disabled={!isEditing}
                      placeholder="Iván Andrés"
                    />
                    <FormField
                      label="Apellido"
                      value={formData.first_last_name}
                      onChange={handleInputChange('first_last_name')}
                      required
                      disabled={!isEditing}
                      placeholder="Espinosa"
                    />
                  </div>
                  <div className="mb-8">
                    <div className="bg-neutral-100 rounded-t-md px-4 py-2 font-semibold text-primary border-b border-neutral-300">Roles seleccionados</div>
                    <div className="bg-white rounded-b-md px-4 py-2 min-h-[60px] border border-neutral-300 border-t-0">
                      {formData.roles && formData.roles.length === 0 ? (
                        <div className="text-neutral-400">No hay roles seleccionados</div>
                      ) : (
                        <ul>
                          {formData.roles && formData.roles.map((role, idx) => (
                            <li key={role.value || role} className="flex items-center justify-between py-1">
                              <span>{role.label || role}</span>
                              {isEditing && (
                                <button
                                  type="button"
                                  className="text-neutral-500 hover:text-error ml-2"
                                  onClick={() => handleRemoveRole(role)}
                                  aria-label="Remove role"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {!isFormValid && submitLoading && (
                    <div className="flex items-center gap-2 text-error mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Please complete all required fields before submitting the form.</span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="flex justify-end gap-4 mt-2">
                      <button
                        type="button"
                        className="bg-white border border-error text-error px-8 py-2 rounded-md font-semibold hover:bg-error/10"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-white px-8 py-2 rounded-md font-semibold hover:bg-accent disabled:opacity-50"
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
    </>
  );
}
