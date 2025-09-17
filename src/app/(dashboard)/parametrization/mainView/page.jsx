"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFilter, FiEye } from "react-icons/fi";
import { createColumnHelper } from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import TypesModal from "../../../components/parametrization/TypesModal";
import AddModifyTypesModal from "../../../components/parametrization/AddModifyTypesModal";
import FilterSection from "@/app/components/parametrization/FilterSection";
import TableList from "@/app/components/shared/TableList";
import {
  SuccessModal,
  ErrorModal,
} from "../../../components/shared/SuccessErrorModal";
import {
  getTypesCategories,
  getTypesByCategory,
  createTypeItem,
  updateTypeItem,
  toggleTypeStatus,
} from "@/services/parametrizationService";
import { useTheme } from "@/contexts/ThemeContext";

// Función helper para determinar si está activo basado en id_statues
const isActiveFromId = (idStatues) => {
  return idStatues === 1;
};

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState("Types");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para Modal de detalles (lista de parámetros por categoría)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parametersData, setParametersData] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(false);

  // Estados para Modal de agregar/editar parámetros
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Estados para los modales de success/error
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Función para mostrar modal de éxito
  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  // Función para mostrar modal de error
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  // Función para obtener categorías de Types
  const fetchCategoriesData = async () => {
    setLoading(true);

    try {
      const response = await getTypesCategories();

      // Mapear los datos del backend al formato esperado por la vista
      const mappedData = response.map((item) => ({
        id: item.id_types_categories,
        name: item.name,
        description: item.description,
        type: "Types",
      }));

      setData(mappedData);
    } catch (err) {
      const errorMsg = `Error loading Types categories: ${err.message}`;
      showErrorModal(errorMsg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener parámetros por categoría
  const fetchParametersByCategory = async (categoryId) => {
    setLoadingParameters(true);
    try {
      const response = await getTypesByCategory(categoryId);

      // Mapear los datos al formato esperado por el modal
      // CAMBIO PRINCIPAL: Usar id_statues en lugar del texto "estado"
      const mappedParameters = response.map((item) => ({
        id: item.id_types,
        typeName: item.name,
        name: item.name,
        description: item.description,
        id_statues: item.id_statues, // Mantener el ID del estado original
        status: item.estado, // Convertir ID a texto para display
        isActive: isActiveFromId(item.id_statues), // Determinar si está activo basado en ID
      }));

      setParametersData(mappedParameters);
    } catch (err) {
      const errorMsg = `Error loading parameters: ${err.message}`;
      showErrorModal(errorMsg);
      setParametersData([]);
    } finally {
      setLoadingParameters(false);
    }
  };

  // Función para validar nombres duplicados
  const validateDuplicateName = (name, excludeId = null) => {
    // Validar que name no sea undefined o null
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const normalizedName = name.trim().toLowerCase();
    return parametersData.some(
      (param) =>
        param.typeName.toLowerCase() === normalizedName &&
        param.id !== excludeId
    );
  };

  // Efecto para cargar datos
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // ==================== HANDLERS PARA MODAL DE DETALLES ====================

  // Abrir modal de detalles (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = async (categoryId) => {
    const category = data.find((item) => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsDetailsModalOpen(true);

      // Cargar los parámetros de esta categoría
      await fetchParametersByCategory(categoryId);
    }
  };

  // Cerrar modal de detalles
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
    setParametersData([]);
  };

  // ==================== HANDLERS PARA MODAL DE FORMULARIO ====================

  // Abrir modal de formulario en modo ADD
  const handleAddParameter = () => {
    setFormMode("add");
    setSelectedParameter(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario en modo EDIT
  const handleEditParameter = (parameterId) => {
    const parameterToEdit = parametersData.find(
      (param) => param.id === parameterId
    );
    if (parameterToEdit) {
      setFormMode("modify");
      setSelectedParameter(parameterToEdit);
      setIsFormModalOpen(true);
    }
  };

  // Cerrar modal de formulario
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedParameter(null);
    setFormMode("add");
  };

  // Guardar/Actualizar parámetro
  const handleSaveParameter = async (parameterData) => {
    try {
      // Validar nombres duplicados
      if (formMode === "add") {
        if (validateDuplicateName(parameterData.typeName)) {
          throw new Error(
            `A parameter with the name "${parameterData.typeName}" already exists in this category`
          );
        }
      } else {
        if (
          validateDuplicateName(parameterData.typeName, selectedParameter.id)
        ) {
          throw new Error(
            `A parameter with the name "${parameterData.typeName}" already exists in this category`
          );
        }
      }

      if (formMode === "add") {
        // Crear nuevo parámetro
        const payload = {
          name: parameterData.typeName,
          description: parameterData.description,
          types_category: selectedCategory.id,
          responsible_user: 1, // TODO: Obtener del contexto de usuario
        };

        const createdResponse = await createTypeItem(payload);

        // Si se crea como inactivo, hacer toggle después de crear
        if (!parameterData.isActive) {
          try {
            // Primero recargar la lista para obtener el ID del nuevo elemento
            await fetchParametersByCategory(selectedCategory.id);

            // Encontrar el elemento recién creado (será el último con el nombre correspondiente)
            const updatedParameters = await getTypesByCategory(
              selectedCategory.id
            );
            const newParameter = updatedParameters.find(
              (p) => p.name === parameterData.typeName
            );

            if (newParameter) {
              const newParameterId = newParameter.id_types;
              await toggleTypeStatus(newParameterId);
            }
          } catch (toggleError) {
            // Error handling sin console.log
          }
        }

        // Recargar la lista de parámetros después de crear
        await fetchParametersByCategory(selectedCategory.id);

        // Mostrar mensaje de éxito
        showSuccessModal(
          `Parameter "${parameterData.typeName}" has been created successfully.`
        );
      } else {
        // Actualizar parámetro existente

        // Si hay cambio de estado desde el toggle, solo recargar datos
        if (parameterData.statusChanged) {
          // Recargar la lista de parámetros después del toggle
          await fetchParametersByCategory(selectedCategory.id);

          // Mostrar mensaje de éxito si viene de la respuesta
          if (parameterData.message) {
            showSuccessModal(parameterData.message);
          }
        } else {
          // Actualización normal de datos del formulario
          const updatePayload = {
            name: parameterData.typeName,
            description: parameterData.description,
            responsible_user: 1, // TODO: Obtener del contexto de usuario
          };

          const updatedResponse = await updateTypeItem(
            selectedParameter.id,
            updatePayload
          );

          // Comparar basado en isActive en lugar del texto del estado
          // Si el estado cambió, hacer toggle
          if (parameterData.isActive !== selectedParameter.isActive) {
            try {
              await toggleTypeStatus(selectedParameter.id);
            } catch (toggleError) {
              // Error handling sin console.log
            }
          }

          // Recargar la lista de parámetros después de actualizar
          await fetchParametersByCategory(selectedCategory.id);

          // Mostrar mensaje de éxito
          showSuccessModal(
            `Parameter "${parameterData.typeName}" has been updated successfully.`
          );
        }
      }

      // Cerrar el modal solo si no es un cambio de estado
      if (!parameterData.statusChanged) {
        handleCloseFormModal();
      }
    } catch (err) {
      const errorMsg = `Error ${
        formMode === "add" ? "creating" : "updating"
      } parameter: ${err.message}`;

      // Mostrar modal de error
      showErrorModal(errorMsg);

      // Re-lanzar el error para que lo maneje el modal solo si no es un cambio de estado
      if (!parameterData.statusChanged) {
        throw new Error(errorMsg);
      }
    }
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Category name",
        cell: (info) => (
          <div className="font-medium text-primary">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Details",
        cell: (info) => (
          <button
            onClick={() => handleViewDetails(info.getValue())}
            className="parametrization-action-button p-2 transition-colors lg:opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [data]
  );

  // Crear array de nombres existentes para validación
  const existingNames = parametersData.map(param => param.typeName);

  return (
    <div className="parametrization-page p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
            Parameterization
          </h1>
        </div>

        {/* Filter Section */}
        <FilterSection
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          placeholder="Search categories..."
        />

        {/* Navigation Menu - Tabs para Types, States, Brands, etc. */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Table */}
        <TableList
          columns={columns}
          data={data}
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>

      {/* Modal de Detalles - Lista de parámetros por categoría */}
      <TypesModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        categoryName={selectedCategory?.name || ""}
        data={parametersData}
        loading={loadingParameters}
        onAddItem={handleAddParameter}
        onEditItem={handleEditParameter}
      />

      {/* Modal de Formulario - Agregar/editar parámetros */}
      <AddModifyTypesModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        status={selectedParameter}
        category={selectedCategory?.name || ""}
        onSave={handleSaveParameter}
        existingNames={existingNames}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  );
};

export default ParameterizationView;