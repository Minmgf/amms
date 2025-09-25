"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiEye } from "react-icons/fi";
import { createColumnHelper } from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import UnitListModal from "../../../components/parametrization/UnitListModal";
import AddModifyUnitModal from "../../../components/parametrization/AddModifyUnitModal";
import FilterSection from "@/app/components/parametrization/FilterSection";
import TableList from "@/app/components/shared/TableList";
import {
  getUnitsCategories,
  getUnitsByCategory,
} from "@/services/parametrizationService";
import { useTheme } from "@/contexts/ThemeContext";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState("Unidades");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Estados para UnitListModal
  const [isUnitListModalOpen, setIsUnitListModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryParameters, setCategoryParameters] = useState([]);

  // Estados para AddModifyUnitModal
  const [isAddModifyModalOpen, setIsAddModifyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedParameter, setSelectedParameter] = useState(null);

  const fetchData = async () => {
    console.log("📡 Fetching units categories...");
    setLoading(true);
    setError(null);

    try {
      const response = await getUnitsCategories();
      console.log("✅ Categories API Response:", response);

      const transformedData = (response.data || response).map((category) => ({
        id: category.id_units_categories,
        name: category.name,
        description: category.description,
        details: "",
        parameters: [],
      }));

      console.log("🔄 Transformed categories data:", transformedData);
      setData(transformedData);
    } catch (err) {
      console.error("❌ Error in fetchData:", err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Sin dependencia de activeMenuItem

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  // Función para recargar los datos de la categoría seleccionada
  const handleReloadCategoryData = useCallback(async () => {
    if (selectedCategory) {
      try {
        console.log("🔄 Reloading category data...");
        const response = await getUnitsByCategory(selectedCategory.id);
        console.log("🔍 Raw unit data from reload:", response.data[0]);

        const transformedUnits = response.data.map((unit) => {
          console.log("🔍 Individual unit from reload:", unit);
          return {
            id: unit.id_units,
            unitName: unit.name,
            symbol: unit.symbol,
            value: unit.unit_type_name,
            unitType:
              unit.unit_type ||
              unit.id_types ||
              unit.unit_type_id ||
              unit.id_unit_type,
            status: unit.statues_name,
            statusId: unit.id_statues,
            description: unit.description,
          };
        });

        console.log("🔍 Transformed units from reload:", transformedUnits[0]);

        setCategoryParameters(transformedUnits);
      } catch (error) {
        console.error("❌ Error reloading category data:", error);
      }
    }
  }, [selectedCategory]);

  // ==================== HANDLERS PARA UnitListModal ====================

  // Abrir UnitListModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = useCallback(
    async (categoryId) => {
      const category = data.find((item) => item.id === categoryId);

      if (category) {
        setSelectedCategory(category);
        setIsUnitListModalOpen(true);

        try {
          const response = await getUnitsByCategory(categoryId);
          console.log("✅ Units API Response:", response);
          console.log("🔍 Raw unit data from API:", response.data[0]);

          const transformedUnits = response.data.map((unit) => {
            console.log("🔍 Individual unit from handleViewDetails:", unit);
            return {
              id: unit.id_units,
              unitName: unit.name,
              symbol: unit.symbol,
              value: unit.unit_type_name,
              unitType:
                unit.unit_type ||
                unit.id_types ||
                unit.unit_type_id ||
                unit.id_unit_type,
              status: unit.statues_name,
              statusId: unit.id_statues,
              description: unit.description,
            };
          });

          console.log("🔍 Transformed units:", transformedUnits[0]);

          setCategoryParameters(transformedUnits);
        } catch (error) {
          console.error("❌ Error in handleViewDetails:", error);
          setCategoryParameters([]);
        }
      }
    },
    [data]
  );

  // Cerrar UnitListModal
  const handleCloseUnitListModal = () => {
    setIsUnitListModalOpen(false);
    setSelectedCategory(null);
    setCategoryParameters([]);
  };

  // ==================== HANDLERS PARA AddModifyUnitModal ====================

  // Abrir AddModifyUnitModal en modo ADD (desde botón "Add Parameter" del UnitListModal)
  const handleAddParameter = () => {
    setModalMode("add");
    setSelectedParameter(null);
    setIsAddModifyModalOpen(true);
  };

  // Abrir AddModifyUnitModal en modo EDIT (desde botón "Edit" de la tabla del UnitListModal)
  const handleEditParameter = (parameterId) => {
    const parameter = categoryParameters.find((p) => p.id === parameterId);
    if (parameter) {
      setModalMode("modify");
      setSelectedParameter(parameter);
      setIsAddModifyModalOpen(true);
    }
  };

  // Cerrar AddModifyUnitModal
  const handleCloseAddModifyModal = () => {
    setIsAddModifyModalOpen(false);
    setSelectedParameter(null);
    setModalMode("add");
  };

  // Guardar/actualizar parameter
  const handleSaveParameter = async (parameterData) => {
    console.log("💾 Saving/updating parameter:", parameterData);

    try {
      if (modalMode === "add") {
        // Si es modo agregar y hay mensaje de éxito, recargar datos
        if (parameterData.success) {
          console.log("✅ Unit created successfully, reloading data...");
          // Recargar la lista de parámetros
          if (selectedCategory) {
            const response = await getUnitsByCategory(selectedCategory.id);
            console.log("🔄 Reloaded units:", response);

            const transformedUnits = response.data.map((unit) => {
              console.log("🔍 Individual unit from add save:", unit);
              return {
                id: unit.id_units,
                unitName: unit.name,
                symbol: unit.symbol,
                value: unit.unit_type_name,
                unitType:
                  unit.unit_type ||
                  unit.id_types ||
                  unit.unit_type_id ||
                  unit.id_unit_type,
                status: unit.statues_name,
                statusId: unit.id_statues,
                description: unit.description,
              };
            });

            setCategoryParameters(transformedUnits);
          }
        } else {
          // Lógica anterior para modo mock (mantener por compatibilidad)
          const newParameter = {
            ...parameterData,
            id: Date.now(),
          };

          const updatedParameters = [...categoryParameters, newParameter];
          setCategoryParameters(updatedParameters);

          const updatedData = data.map((item) =>
            item.id === selectedCategory.id
              ? { ...item, parameters: updatedParameters }
              : item
          );
          setData(updatedData);
        }
      } else if (modalMode === "modify") {
        // Si es modo modificar y hay mensaje de éxito O cambio de estado, recargar datos
        if (parameterData.success || parameterData.statusChanged) {
          console.log(
            "✅ Unit updated/status changed successfully, reloading data..."
          );
          // Recargar la lista de parámetros desde la API
          if (selectedCategory) {
            const response = await getUnitsByCategory(selectedCategory.id);
            console.log("🔄 Reloaded units after update:", response);

            console.log("🔍 Raw unit data from API:", response.data[0]);

            const transformedUnits = response.data.map((unit) => {
              console.log("🔍 Individual unit from modify save:", unit);
              return {
                id: unit.id_units,
                unitName: unit.name,
                symbol: unit.symbol,
                value: unit.unit_type_name,
                unitType:
                  unit.unit_type ||
                  unit.id_types ||
                  unit.unit_type_id ||
                  unit.id_unit_type,
                status: unit.statues_name,
                statusId: unit.id_statues,
                description: unit.description,
              };
            });

            console.log("🔍 Transformed units:", transformedUnits[0]);

            setCategoryParameters(transformedUnits);
          }
        } else {
          // Lógica anterior para modo mock (mantener por compatibilidad)
          const updatedParameters = categoryParameters.map((param) =>
            param.id === selectedParameter.id
              ? { ...param, ...parameterData }
              : param
          );
          setCategoryParameters(updatedParameters);

          const updatedData = data.map((item) =>
            item.id === selectedCategory.id
              ? { ...item, parameters: updatedParameters }
              : item
          );
          setData(updatedData);
        }
      }
    } catch (error) {
      console.error("❌ Error in handleSaveParameter:", error);
    }
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre categoría",
        cell: (info) => (
          <div className="font-medium text-primary">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Descripción",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Detalles",
        cell: (info) => (
          <button
            onClick={() => handleViewDetails(info.getValue())}
            className="parametrization-action-button p-2 transition-colors lg:opacity-0 group-hover:opacity-100"
            title="Ver detalles"
          >
            <FiEye className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [handleViewDetails]
  );

  return (
    <div className="parametrization-page p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
            Parametrización
          </h1>
        </div>

        {/* Filter Section */}
        <FilterSection
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          placeholder="Search categories..."
        />

        {/* Navigation Menu */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Table using TableList component */}
        <TableList
          columns={columns}
          data={data}
          loading={loading}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />

        {error && (
          <div className="parametrization-error p-8 text-center">
            Error: {error}
          </div>
        )}
      </div>

      {/* UnitListModal - Modal de lista de parámetros */}
      <UnitListModal
        isOpen={isUnitListModalOpen}
        onClose={handleCloseUnitListModal}
        categoryName={selectedCategory?.name || ""}
        data={categoryParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
        onReloadData={handleReloadCategoryData}
      />

      {/* AddModifyUnitModal - Modal para agregar/editar parámetros */}
      <AddModifyUnitModal
        isOpen={isAddModifyModalOpen}
        onClose={handleCloseAddModifyModal}
        mode={modalMode}
        unit={selectedParameter}
        category={selectedCategory?.name || ""}
        categoryId={selectedCategory?.id || 1}
        onSave={handleSaveParameter}
      />
    </div>
  );
};

export default ParameterizationView;
