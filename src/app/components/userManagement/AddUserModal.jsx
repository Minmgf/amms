"use client";
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import Select from 'react-select';
import { getDocumentTypes, getGenderTypes, getRoleTypes, createUser } from '../../../services/authService';
import { SuccessModal, ErrorModal } from '../shared/SuccessErrorModal';

const getAuthToken = () => {
  let token = localStorage.getItem('token');
  if (!token) token = sessionStorage.getItem('token');
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    first_last_name: '',
    second_last_name: '',
    type_document_id: null,
    document_number: '',
    date_issuance_document: '',
    birthday: '',
    gender_id: null,
    roles: [],
    role: null
  });

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
    if (isOpen) fetchData();
  }, [isOpen]);

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
        roles: [],
        role: null
      });
      setError(null);
      setSuccess(false);
      setShowSuccessModal(false);
      setShowErrorModal(false);
      setModalMessage('');
      setHasSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!isFormValid) return;
    try {
      setSubmitLoading(true);
      setError(null);
      const userData = {
        name: formData.name,
        first_last_name: formData.first_last_name,
        second_last_name: formData.second_last_name,
        type_document_id: formData.type_document_id?.value || formData.type_document_id,
        document_number: String(formData.document_number),
        date_issuance_document: formData.date_issuance_document,
        birthday: formData.birthday,
        gender_id: formData.gender_id?.value || formData.gender_id,
        roles: formData.roles.map(role => role.value || role)
      };
      const response = await createUser(userData);
      if (response.success) {
        setSuccess(true);
        setModalMessage('Usuario creado exitosamente');
        setShowSuccessModal(true);
      } else {
        setError(response.message || ' ');
        setModalMessage(response.message || ' ');
        setShowErrorModal(true);
      }
    } catch (err) {
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
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
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

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    if (onUserCreated) onUserCreated();
  };

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
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[50] w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-6 pb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">users / new-user</div>
              <Dialog.Title asChild>
                <h2 className="text-2xl font-bold text-black">Register User</h2>
              </Dialog.Title>
            </div>
            <button onClick={onClose} className="text-black text-2xl font-bold hover:text-red-500">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2">
            {/* Primera fila: 3 inputs principales */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Identification type</label>
                <Select
                  value={formData.type_document_id}
                  onChange={(option) => setFormData(prev => ({ ...prev, type_document_id: option }))}
                  options={documentTypes.map(doc => ({ value: doc.id, label: doc.name }))}
                  placeholder="C.C"
                  className={`react-select-container ${hasSubmitted && !formData.type_document_id ? 'border-red-600' : 'border-gray-300'}`}
                  isSearchable
                  isClearable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: hasSubmitted && !formData.type_document_id ? '#e53935' : '#d1d5db',
                      backgroundColor: '#fafafa',
                      minHeight: '38px',
                      fontSize: '15px'
                    })
                  }}
                />
              </div>
              {/* Número de documento */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Identification number</label>
                <input
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                  className={`w-full rounded border px-3 py-2 bg-white text-black text-base ${hasSubmitted && !formData.document_number ? 'border-red-600' : 'border-gray-300'}`}
                  placeholder=""
                />
              </div>
              {/* Género */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Gender</label>
                <Select
                  value={formData.gender_id}
                  onChange={(option) => setFormData(prev => ({ ...prev, gender_id: option }))}
                  options={genderTypes.map(gender => ({ value: gender.id, label: gender.name }))}
                  placeholder=""
                  className={`react-select-container ${hasSubmitted && !formData.gender_id ? 'border-red-600' : 'border-gray-300'}`}
                  isSearchable
                  isClearable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: hasSubmitted && !formData.gender_id ? '#e53935' : '#d1d5db',
                      backgroundColor: '#fafafa',
                      minHeight: '38px',
                      fontSize: '15px'
                    })
                  }}
                />
              </div>
            </div>
            {/* Segunda fila: fechas y rol */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Fecha de expedición */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Expedition date</label>
                <input
                  type="date"
                  value={formData.date_issuance_document}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_issuance_document: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-black text-base"
                />
              </div>
              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Birth date</label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-black text-base"
                />
              </div>
              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Role</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={formData.role}
                      onChange={(option) => setFormData(prev => ({ ...prev, role: option }))}
                      options={roleTypes.map(role => ({
                        value: role.role_id,
                        label: role.role_name,
                        status: role.status_name
                      }))}
                      placeholder=""
                      isSearchable
                      isClearable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: '#d1d5db',
                          backgroundColor: '#fafafa',
                          minHeight: '38px',
                          fontSize: '15px'
                        })
                      }}
                      formatOptionLabel={(option) => (
                        <div className="flex flex-col text-black">
                          <span className="font-medium">{option.label}</span>
                          <span className={`text-xs ${option.status === 'Activo' ? 'text-green-600' : 'text-red-600'}`}>
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
                    className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            {/* Roles seleccionados */}
            <div className="mb-6">
              <div className="bg-gray-100 rounded-t px-4 py-2 font-semibold text-black border-b border-gray-300">Selected roles</div>
              <div className="bg-gray-100 rounded-b px-4 py-4 min-h-[60px]">
                {formData.roles.length === 0 ? (
                  <p className="text-gray-500 text-sm">No roles added yet. Select an item from the dropdown above and click "Add".</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map((role, index) => (
                      <span key={index} className="px-3 py-1 bg-white border border-gray-300 text-black rounded-full text-sm flex items-center gap-2">
                        {role.label}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="text-red-600 hover:opacity-80 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full rounded border px-3 py-2 bg-white text-black text-base ${hasSubmitted && !formData.name ? 'border-red-600' : 'border-gray-300'}`}
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.first_last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_last_name: e.target.value }))}
                  className={`w-full rounded border px-3 py-2 bg-white text-black text-base ${hasSubmitted && !formData.first_last_name ? 'border-red-600' : 'border-gray-300'}`}
                  placeholder=""
                />
              </div>
            </div>
            {/* Mensaje de validación */}
            {hasSubmitted && !isFormValid && (
              <div className="flex items-center gap-2 text-red-600 text-base font-semibold mb-4">
                <FaExclamationTriangle />
                Please complete all required fields before submitting the form.
              </div>
            )}
            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || submitLoading}
                className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
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
