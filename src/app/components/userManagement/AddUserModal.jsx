"use client";
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUserPlus, FaPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import Select from 'react-select';
import { getDocumentTypes, getGenderTypes, getRoleTypes, createUser } from '../../../services/authService';
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

export default function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [genderTypes, setGenderTypes] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Estados para los modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Estado para controlar si ya se intentó enviar el formulario
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  // Cargar datos de tipos de documento y géneros
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
          setModalMessage('Error al cargar los datos de configuración');
          setShowErrorModal(true);
        }
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
        setModalMessage('Error al cargar los datos: ' + err.message);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
      setError(null);
      setSuccess(false);
      setShowSuccessModal(false);
      setShowErrorModal(false);
      setModalMessage('');
      setHasSubmitted(false); // Resetear el estado de envío
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar que se intentó enviar el formulario
    setHasSubmitted(true);
    
    if (!isFormValid) return;

    try {
      setSubmitLoading(true);
      setError(null);

      // Preparar los datos en el formato correcto
      const userData = {
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

      console.log('Datos a enviar:', userData);
      console.log('Token actual:', getAuthToken());

      const response = await createUser(userData);
      
      if (response.success) {
        setSuccess(true);
        setModalMessage('Usuario creado exitosamente');
        setShowSuccessModal(true);
        // El modal de éxito se cerrará automáticamente y llamará onSuccessClose
      } else {
        setError(response.message || ' ');
        setModalMessage(response.message || ' ');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Error completo:', err);
      let errorMessage = 'Error al crear el usuario';
      
      if (err.message === 'No hay token disponible') {
        errorMessage = 'Error de autenticación: No hay token disponible. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token expirado') {
        errorMessage = 'Error de autenticación: Token expirado. Por favor, inicie sesión nuevamente.';
      } else if (err.message === 'Token no válido') {
        errorMessage = 'Error de autenticación: Token no válido. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Error de autenticación: Credenciales inválidas. Por favor, inicie sesión nuevamente.';
      } else if (err.response?.data?.detail) {
        // Extraer solo el mensaje específico del detail
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          // Si el detail contiene información sobre documento duplicado
          if (detail.includes('ya está registrado')) {
            const match = detail.match(/documento '(\d+)' ya está registrado/);
            if (match) {
              errorMessage = `El número de documento ${match[1]} ya está registrado por otro usuario.`;
            } else {
              errorMessage = detail;
            }
          } else {
            errorMessage = detail;
          }
        } else {
          errorMessage = 'Error al crear el usuario';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else {
        errorMessage = err.message || 'Error al crear el usuario';
      }
      
      setError(errorMessage);
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddRole = () => {
    if (formData.role && !formData.roles.some(r => r.value === formData.role.value)) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, prev.role],
        role: null
      }));
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.value !== roleToRemove.value)
    }));
  };

  // Función para manejar el cierre del modal de éxito
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    if (onUserCreated) {
      onUserCreated();
    }
  };

  // Función para manejar el cierre del modal de error
  const handleErrorClose = () => {
    setShowErrorModal(false);
  };

  const isFormValid = formData.name && 
    formData.first_last_name && 
    formData.document_number && 
    formData.type_document_id && 
    formData.gender_id;



  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[50] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* DialogTitle para accesibilidad */}
          <Dialog.Title className="sr-only">
            Crear Nuevo Usuario
          </Dialog.Title>
          
          <div className="p-6 card-theme">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClose}
                className="p-2 btn-theme btn-secondary"
              >
                <FaArrowLeft className="text-primary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUserPlus className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">Crear Nuevo Usuario</h2>
                  <p className="text-sm text-secondary">Complete la información del usuario</p>
                </div>
              </div>
            </div>

            {/* Loading inicial */}
                {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="mt-4 text-secondary">Cargando configuración...</p>
              </div>
            )}

            {/* Formulario */}
            {!loading && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`input-theme ${hasSubmitted && !formData.name ? 'border-error' : 'border-primary'}`}
                      placeholder="Ingrese nombre"
                    />
                  </div>

                  {/* Primer Apellido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primer Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.first_last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_last_name: e.target.value }))}
                      className={`input-theme ${hasSubmitted && !formData.first_last_name ? 'border-error' : 'border-primary'}`}
                      placeholder="Ingrese primer apellido"
                    />
                  </div>

                  {/* Segundo Apellido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.second_last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, second_last_name: e.target.value }))}
                      className="input-theme"
                      placeholder="Ingrese segundo apellido"
                    />
                  </div>

                  {/* Tipo de Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <Select
                      value={formData.type_document_id}
                      onChange={(option) => setFormData(prev => ({ ...prev, type_document_id: option }))}
                      options={documentTypes.map(doc => ({ value: doc.id, label: doc.name }))}
                      placeholder="Seleccionar tipo de documento"
                      className={`${hasSubmitted && !formData.type_document_id ? 'border-error text-secondary' : 'text-secondary'}`}
                      isSearchable
                      isClearable
                    />
                  </div>

                  {/* Número de Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      value={formData.document_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                      className={`input-theme ${hasSubmitted && !formData.document_number ? 'border-error' : 'border-primary'}`}
                      placeholder="Ingrese número de documento"
                    />
                  </div>

                  {/* Género */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género *
                    </label>
                    <Select
                      value={formData.gender_id}
                      onChange={(option) => setFormData(prev => ({ ...prev, gender_id: option }))}
                      options={genderTypes.map(gender => ({ value: gender.id, label: gender.name }))}
                      placeholder="Seleccionar género"
                      className={`${hasSubmitted && !formData.gender_id ? 'border-error text-secondary' : 'text-secondary'}`}
                      isSearchable
                      isClearable
                    />
                  </div>

                  {/* Fecha de Expedición */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Expedición
                    </label>
                    <input
                      type="date"
                      value={formData.date_issuance_document}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_issuance_document: e.target.value }))}
                      className="input-theme"
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                      className="input-theme"
                    />
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>

                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <Select
                        value={formData.role}
                        onChange={(option) => setFormData(prev => ({ ...prev, role: option }))}
                        options={roleTypes.map(role => ({ 
                          value: role.role_id, 
                          label: role.role_name,
                          status: role.status_name
                        }))}
                        placeholder="Seleccionar rol"
                        isSearchable
                        isClearable
                        formatOptionLabel={(option) => (
                          <div className="flex flex-col text-secondary">
                            <span className="font-medium">{option.label}</span>
                            <span className={`text-xs ${option.status === 'Activo' ? 'text-success' : 'text-error'}`}>
                              {option.status}
                            </span>
                          </div>
                        )}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRole}
                      disabled={!formData.role}
                      className="btn-theme btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>

                  {/* Roles seleccionados */}
                  <div className="card-secondary rounded-lg p-3 min-h-[60px]">
                    {formData.roles.length === 0 ? (
                      <p className="text-secondary text-sm">No se han agregado roles. Seleccione un rol del dropdown y haga clic en agregar.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.roles.map((role, index) => (
                          <span key={index} className="px-3 py-1 bg-surface text-primary rounded-full text-sm flex items-center gap-2">
                            {role.label}
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(role)}
                              className="text-error hover:opacity-80"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensaje de validación */}
                {hasSubmitted && !isFormValid && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <FaExclamationTriangle />
                    Por favor complete todos los campos requeridos antes de enviar el formulario.
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-theme btn-secondary px-6 py-2"
                  >
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        Crear Usuario
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      
      {/* Modales de Success y Error */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Usuario Creado"
        message="El usuario ha sido creado exitosamente en el sistema."
      />
      
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Error al Crear Usuario"
        message={modalMessage}
      />
    </Dialog.Root>
  );
}
