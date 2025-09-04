"use client";
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUserPlus, FaPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import Select from 'react-select';
import { getDocumentTypes, getGenderTypes, getRoleTypes, createUser } from '../../../services/authService';

export default function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [genderTypes, setGenderTypes] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      console.log('Token actual:', localStorage.getItem('token'));

      const response = await createUser(userData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          if (onUserCreated) {
            onUserCreated();
          }
        }, 2000);
      } else {
        setError(response.message || 'Error al crear el usuario');
      }
    } catch (err) {
      console.error('Error completo:', err);
      if (err.message === 'No hay token disponible') {
        setError('Error de autenticación: No hay token disponible. Por favor, inicie sesión nuevamente.');
      } else if (err.message === 'Token expirado') {
        setError('Error de autenticación: Token expirado. Por favor, inicie sesión nuevamente.');
      } else if (err.message === 'Token no válido') {
        setError('Error de autenticación: Token no válido. Por favor, inicie sesión nuevamente.');
      } else if (err.response?.status === 401) {
        setError('Error de autenticación: Credenciales inválidas. Por favor, inicie sesión nuevamente.');
      } else if (err.response?.data?.message) {
        setError('Error al crear el usuario: ' + err.response.data.message);
      } else if (err.response?.data?.detail) {
        setError('Error al crear el usuario: ' + err.response.data.detail);
      } else {
        setError('Error al crear el usuario: ' + err.message);
      }
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

  const isFormValid = formData.name && 
    formData.first_last_name && 
    formData.document_number && 
    formData.type_document_id && 
    formData.gender_id;



  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* DialogTitle para accesibilidad */}
          <Dialog.Title className="sr-only">
            Crear Nuevo Usuario
          </Dialog.Title>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUserPlus className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Crear Nuevo Usuario</h2>
                  <p className="text-sm text-gray-500">Complete la información del usuario</p>
                </div>
              </div>
            </div>

            {/* Loading inicial */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando configuración...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <FaExclamationTriangle />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <FaCheckCircle />
                  <p>Usuario creado exitosamente</p>
                </div>
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
                      className={`w-full px-3 py-2 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.name ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-3 py-2 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.first_last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className={`${!formData.type_document_id ? 'border-red-500 text-gray-600' : 'text-gray-600'}`}
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
                      className={`w-full px-3 py-2 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.document_number ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`${!formData.gender_id ? 'border-red-500 text-gray-600' : 'text-gray-600'}`}
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
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <Select
                        value={formData.role}
                        onChange={(option) => setFormData(prev => ({ ...prev, role: option }))}
                        options={roleTypes.map(role => ({ 
                          value: role.role_id, 
                          label: role.role_name,
                        //   description: role.role_description,
                        //   status: role.status_name
                        }))}
                        placeholder="Seleccionar rol"
                        isSearchable
                        isClearable
                        formatOptionLabel={(option) => (
                          <div className="flex flex-col text-gray-600
                          ">
                            <span className="font-medium">{option.label}</span>
                            {/* <span className="text-xs text-gray-500">{option.description}</span> */}
                            <span className={`text-xs ${
                              option.status === 'Activo' ? 'text-green-600' : 'text-red-600'
                            }`}>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>

                  {/* Roles seleccionados */}
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

                {/* Mensaje de validación */}
                {!isFormValid && (
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
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || submitLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </Dialog.Root>
  );
}
