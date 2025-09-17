"use client";
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';
import JobModal from './JobModal'; // Add this import
import { changeDepartmentStatus, getChargesDepartments, createJob, updateJob } from '@/services/parametrizationService';
import { SuccessModal, ErrorModal } from '@/app/components/shared/SuccessErrorModal';

const DepartmentModal = ({
  isOpen,
  onClose,
  mode = 'add', // 'add' or 'edit'
  departmentData = null,
  onSave,
  existingDepartments = [],
  onStatusChange
}) => {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    isActive: true,
    jobTitles: []
  });

  const [errors, setErrors] = useState({
    categoryName: '',
    description: ''
  });

  // Add job modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalMode, setJobModalMode] = useState('add'); // 'add' or 'modify'
  const [selectedJob, setSelectedJob] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [jobTitles, setJobTitles] = useState([]);

  // Datos mock para cuando no hay posiciones registradas
  const emptyJobTitles = [];

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
      } catch (err) {

      }
    }
  }, []);

  useEffect(() => {
    if (departmentData) {
      setFormData({
        id: departmentData.id || departmentData.id_employee_department || '',
        department: departmentData.department || departmentData.name || '',
        categoryName: departmentData.department || departmentData.name || '',
        description: departmentData.description || '',
        isActive: departmentData.status === 'Activo',
        jobTitles: departmentData.jobTitles || []
      });

      fetchJobs(departmentData.id || departmentData.id_employee_department);

    } else {
      setFormData({
        id: '',
        department: '',
        categoryName: '',
        description: '',
        isActive: true,
        status: 'Active',
        jobTitles: []
      });
      setJobTitles([]);
    }

    setErrors({
      categoryName: '',
      description: ''
    });
  }, [departmentData, mode, isOpen]);


  const handleToggleStatus = async () => {
    if (!formData.id) return;

    try {
      const response = await changeDepartmentStatus(formData.id);
      setModalMessage(response.message);
      setSuccessOpen(true);
      setFormData(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      setModalMessage(error.response.data.name || "Failed");
      setErrorOpen(true);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const fetchJobs = async (departmentId) => {
    if (!departmentId) return;
    try {
      const response = await getChargesDepartments(departmentId);

      if (Array.isArray(response)) {
        setJobTitles(response.map(job => ({
          id: job.id_employee_charge,
          name: job.name,
          description: job.description,
          idStatues: job.id_statues,
          status: job.estado
        })));
      } else if (response.data) {
        setJobTitles(response.data.map(job => ({
          id: job.id_job || job.id,
          name: job.name,
          description: job.description,
          idStatues: job.id_statues,
          status: job.estado
        })));
      } else {
        setJobTitles([]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobTitles([]);
    }
  };



  const validateForm = () => {
    const newErrors = {};

    // Validación de campo obligatorio
    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Please enter a name for the new department';
    } else if (mode === 'add') {
      // Validación de unicidad para modo add
      const isDuplicate = existingDepartments.some(dept =>
        dept.department && dept.department.toLowerCase().trim() === formData.categoryName.toLowerCase().trim()
      );
      if (isDuplicate) {
        newErrors.categoryName = 'This department name already exist';
      }
    } else if (mode === 'edit') {
      // Validación de unicidad para modo edit (excluir el departamento actual)
      const isDuplicate = existingDepartments.some(dept =>
        dept.department && 
        dept.department.toLowerCase().trim() === formData.categoryName.toLowerCase().trim() &&
        dept.id !== departmentData.id
      );
      if (isDuplicate) {
        newErrors.categoryName = 'This department name already exist';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const dataToSave = {
      ...formData,
      jobTitles
    };
    onSave(dataToSave);
    onClose();
  };

  const handleAddJob = () => {
    setSelectedJob(null);
    setJobModalMode('add');
    setIsJobModalOpen(true);
  };

  const handleEditJob = (jobId) => {
    const job = jobTitles.find(j => j.id === jobId);
    setSelectedJob(job);
    setJobModalMode('modify');
    setIsJobModalOpen(true);
  };

  // Add job modal handlers
  const handleCloseJobModal = () => {
    setIsJobModalOpen(false);
    setSelectedJob(null);
  };

  const handleSaveJob = async (jobData) => {
    if (jobModalMode === 'add') {
      if (mode === 'add') {
        // Crear job localmente para un departamento nuevo
        const newJob = {
          id: jobTitles.length > 0 ? Math.max(...jobTitles.map(j => j.id)) + 1 : 1,
          name: jobData.jobTitle,
          description: jobData.description,
          status: jobData.isActive ? 'Active' : 'Inactive'
        };
        setJobTitles(prev => [...prev, newJob]);
      } else {
        // Crear job via backend para un departamento existente
        try {
          const departmentId = formData.id;
          const payload = {
            department: departmentId,
            responsible_user: userId,
            name: jobData.jobTitle,
            description: jobData.description,
          };
          const response = await createJob(payload);
          await fetchJobs(departmentId);

          setModalMessage(response.message || 'Job created successfully');
          setSuccessOpen(true);
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to create job';
          setModalMessage(message);
          setErrorOpen(true);
        }
      }
    } else if (jobModalMode === 'modify') {
      if (mode === 'add') {
        // Editar job localmente para departamento nuevo
        setJobTitles(prev => prev.map(job =>
          job.id === selectedJob.id
            ? {
              ...job,
              name: jobData.jobTitle,
              description: jobData.description,
              status: jobData.isActive ? 'Active' : 'Inactive'
            }
            : job
        ));
      } else {
        // Editar job via backend para departamento existente
        try {
          const jobId = selectedJob.id;
          const payload = {
            name: jobData.jobTitle,
            description: jobData.description,
            responsible_user: userId
          };
          const response = await updateJob(jobId, payload);
          await fetchJobs(formData.id);
          setModalMessage(response.message || 'Job updated successfully');
          setSuccessOpen(true);
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update job';
          setModalMessage(message);
          setErrorOpen(true);
        }
      }
    }
  };



  if (!isOpen) return null;

  const isAddMode = mode === 'add';
  const hasJobTitles = jobTitles.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isAddMode ? 'Add department' : 'Modify Department'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={`block text-sm font-medium mb-2 ${errors.categoryName ? 'text-red-500' : 'text-gray-700'
                  }`}>
                  Department name
                </label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => handleInputChange('categoryName', e.target.value)}
                  placeholder={isAddMode ? "Enter a name" : ""}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                    }`}
                />
                {errors.categoryName && (
                  <div className="flex items-center mt-1 text-red-500 text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.categoryName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder=""
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Toggle Switch - Solo visible en modo edit */}
            {!isAddMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activate/Deactivate
                </label>
                <button
                  onClick={() => handleToggleStatus()}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${formData.isActive ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            )}



            {/* Jobs Titles List Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Jobs Titles List
              </h3>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-4 gap-4 px-4 py-3">
                    <div className="text-sm font-medium text-gray-700">Job name</div>
                    <div className="text-sm font-medium text-gray-700">Description</div>
                    <div className="text-sm font-medium text-gray-700">Status</div>
                    <div className="text-sm font-medium text-gray-700">Actions</div>
                  </div>
                </div>


                {/* Table Body */}
                <div className="bg-white min-h-[120px]">
                  {hasJobTitles ? (
                    jobTitles.map((job) => (
                      <div key={job.id} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="text-sm text-gray-900">{job.name}</div>
                        <div className="text-sm text-gray-600">{job.description}</div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${job.idStatues === 1
                              ? 'bg-green-100 text-green-800'
                              : job.idStatues === 2
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {job.status}
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={() => handleEditJob(job.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                          >
                            <FiEdit3 className="w-3 h-3 mr-1.5" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-sm text-gray-500">
                        There are no positions registered for this department.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Job Button */}
              <button
                onClick={handleAddJob}
                className="px-6 py-2 btn-theme btn-secondary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Job
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSave}
              className="px-8 py-3 btn-theme btn-primary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Job Modal */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={handleCloseJobModal}
        mode={jobModalMode}
        departmentMode={mode}
        jobData={selectedJob}
        departmentId={formData.id}
        departmentName={formData.categoryName}
        onSave={handleSaveJob}
        existingJobs={jobTitles} // Pasar jobs existentes para validar unicidad
        onStatusChange={fetchJobs}
      />
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Failed"
        message={modalMessage}
      />
    </>
  );
};

export default DepartmentModal;