"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFilter, FiEdit3, FiBell, FiEye } from "react-icons/fi";
import { createColumnHelper } from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import CategoryModal from "../../../components/parametrization/ModelListModal";
import BrandFormModal from "../../../components/parametrization/BrandFormModal";
import AddModifyModelModal from "../../../components/parametrization/AddModifyModelModal";
import FilterSection from "@/app/components/parametrization/FilterSection";
import TableList from "@/app/components/shared/TableList";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getBrandCategories,
  getModelsByBrand,
  createBrand,
  getBrands,
  editBrand,
  editModel,
  createModel,
} from "@/services/parametrizationService";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [id, setId] = useState("");
  const [activeMenuItem, setActiveMenuItem] = useState("Marcas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Estados para CategoryModal (lista de brands)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBrands, setCategoryBrands] = useState([]); // ← lista de brands por categoría

  // Estados para BrandFormModal (agregar/editar brand)
  const [isBrandFormModalOpen, setIsBrandFormModalOpen] = useState(false);
  const [brandFormMode, setBrandFormMode] = useState("add"); // 'add' o 'edit'
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Estados para AddModifyModelModal (agregar/editar model)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalMode, setModelModalMode] = useState("add");
  const [selectedModelData, setSelectedModelData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  // Función para obtener datos del backend
  const fetchData = async (menuItem = "Marcas") => {
    setLoading(true);
    setError(null);

    try {
      // 🚀 GET real al backend
      const categories = await getBrandCategories();

      // Adaptar a lo que espera tu tabla
      const formattedData = categories.map((c) => ({
        id: c.id_brands_categories,
        name: c.name,
        description: c.description,
      }));

      setData(formattedData);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsByCategory = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await getBrands(categoryId);
      const normalized = (response || []).map((b) => {
        return {
          id: b.id_brands,
          name: b.name,
          description: b.description,
          idStatues: b.id_statues,
          idStatues: b.id_statues,
          status: b.estado,
          isActive: b.id_statues === 1,
          models: b.models || [],
        };
      });
      setCategoryBrands(normalized); // actualiza el estado de la lista
    } catch (error) {
      console.error("Error fetching brands:", error);
      setCategoryBrands([]);
    }
  };

  useEffect(() => {
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  const handleStatusChanged = (brandId) => {
    setCategoryBrands((prev) =>
      prev.map((b) =>
        b.id === brandId
          ? {
            ...b,
            isActive: !b.isActive,
            idStatues: b.isActive ? 2 : 1,
            status: b.isActive ? "Inactivo" : "Habilitado"
          }
          : b
      )
    );
    setTimeout(() => {
      if (selectedCategory?.id) {
        fetchBrandsByCategory(selectedCategory.id);
      }
    }, 500);
  };

  // ==================== HANDLERS PARA CategoryModal ====================

  // Abrir CategoryModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = (categoryId) => {
    const category = data.find((item) => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true); // solo abrir el modal
      fetchBrandsByCategory(category.id); // 🚀 traer marcas al abrir moda
    }
  };

  // Cerrar CategoryModal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  // ==================== HANDLERS PARA BrandFormModal ====================

  // Abrir BrandFormModal en modo ADD (desde botón "Add Brand" del CategoryModal)
  const handleAddBrand = () => {
    setBrandFormMode("add");
    setSelectedBrand({
      brandName: "",
      description: "",
      models: [], // 👈 inicializar vacío
    });
    setIsBrandFormModalOpen(true);
  };

  // Abrir BrandFormModal en modo EDIT (desde botón "Edit" de la tabla del CategoryModal)
  const handleEditBrand = async (brand) => {
    try {
      const models = await getModelsByBrand(brand.id);

      const normalizedModels = (models || []).map((m) => ({
        id_model: m.id_model,
        modelName: m.name, // <-- mapear 'name' → 'modelName'
        description: m.description,
        isActive: m.id_statues === 1,
        id_statues: m.id_statues,
        estado: m.estado
      }));

      const brandToEdit = {
        id: brand.id,
        brandName: brand.name,
        description: brand.description,
        isActive: brand.isActive,
        idStatues: brand.idStatues,
        status: brand.status,
        models: normalizedModels,
      };

      setSelectedBrand(brandToEdit);
      setBrandFormMode("edit");
      setIsBrandFormModalOpen(true);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  // Cerrar BrandFormModal
  const handleCloseBrandFormModal = () => {
    setIsBrandFormModalOpen(false);
    setSelectedBrand(null);
    setBrandFormMode("add");
  };

  // Guardar nuevo brand
  const handleSaveBrand = async (brandData) => {
    try {
      const payload = {
        name: brandData.brandName,
        description: brandData.description,
        brands_category: selectedCategory.id,
        responsible_user: id,
        models: (brandData.models || []).map((m) => ({
          name: m.modelName,
          description: m.description,
        })),
      };

      const response = await createBrand(payload); // llamamos a tu servicio
      setModalMessage(response.message || "Marca creada exitosamente");
      setSuccessOpen(true);
      fetchBrandsByCategory(selectedCategory.id);
      handleCloseBrandFormModal(); // cerrar modal
      fetchData(activeMenuItem); // refrescar lista
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al crear la marca");
      setErrorOpen(true);
    }
  };

  // Actualizar brand existente
  const handleUpdateBrand = async (brandData) => {
    try {
      const payload = {
        name: brandData.brandName,
        description: brandData.description,
        responsible_user: id, // si el backend lo pide fijo, cámbialo según tu lógica
      };

      // Llamada PUT
      const response = await editBrand(payload, brandData.id);
      setModalMessage(response.mmessage || "Marca actualizada exitosamente");
      setSuccessOpen(true);

      // Refrescar lista de marcas (si tienes fetchBrands o similar)
      await fetchBrandsByCategory(selectedCategory.id);

      // Cerrar modal
      handleCloseBrandFormModal();
    } catch (error) {
      setModalMessage(
        error.response.data.detail || "Error al actualizar la marca"
      );
      setErrorOpen(true);
    }
  };

  // ==================== HANDLERS PARA AddModifyModelModal ====================

  // Handler para actualizar los datos de la marca desde el BrandFormModal
  const handleBrandDataChange = (updatedBrandData) => {
    setSelectedBrand(updatedBrandData);
  };

  // Modificar el handler handleAddModel para pasar los datos actuales del formulario
  const handleAddModel = (currentBrandData) => {
    // Si se pasan datos actuales del formulario, usarlos en lugar del selectedBrand
    if (currentBrandData) {
      setSelectedBrand(currentBrandData);
    }

    setModelModalMode("add");
    setSelectedModelData(null);
    setIsModelModalOpen(true);
  };

  // Modificar el handler handleEditModel para pasar los datos actuales del formulario  
  const handleEditModel = (modelId, currentBrandData) => {
    // Si se pasan datos actuales del formulario, usarlos
    const brandData = currentBrandData || selectedBrand;

    const model = brandData?.models?.find((m) => m.id_model === modelId);
    if (model) {
      // Actualizar selectedBrand si se pasaron datos actuales
      if (currentBrandData) {
        setSelectedBrand(currentBrandData);
      }

      setModelModalMode("edit");
      setSelectedModelData(model);
      setIsModelModalOpen(true);
    }
  };

  // Cerrar AddModifyModelModal
  const handleModelModalClose = () => {
    setIsModelModalOpen(false);
    setSelectedModelData(null);
    setModelModalMode("add");
  };

  // Guardar nuevo model
  const handleModelSave = async (modelData) => {
    try {
      if (brandFormMode === "add") {
        // 🚀 Caso: creando una nueva marca (todavía no existe en backend)
        // Guardamos el modelo solo localmente
        setSelectedBrand((prev) => ({
          ...prev, // 👈 preserva brandName, description, etc.
          models: [
            ...(prev?.models || []),
            {
              id_model: modelData.id_model,
              modelName: modelData.modelName,
              description: modelData.description,
            },
          ],
        }));
      } else if (brandFormMode === "edit") {
        // 🚀 Caso: editando marca existente → modelo debe ir al backend
        if (!selectedBrand?.id) {
          console.error("No se puede crear modelo: falta brandId");
          return;
        }

        const payload = {
          name: modelData.modelName,
          description: modelData.description,
          responsible_user: id,
          brand: selectedBrand.id, // 👈 necesario
        };

        const response = await createModel(payload);
        setModalMessage(response.message || "Modelo creado exitosamente");
        setSuccessOpen(true);
        // Refrescamos modelos desde el backend
        const refreshedModels = await getModelsByBrand(selectedBrand.id);
        const normalizedModels = (refreshedModels || []).map((m) => ({
          id_model: m.id_model,
          modelName: m.name,
          description: m.description,
          isActive: m.estado === "1",
        }));

        setSelectedBrand((prev) => ({
          ...prev,
          models: normalizedModels,
        }));
      }

      handleModelModalClose();
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al crear marca");
      setErrorOpen(true);
    }
  };

  // Actualizar model existente
  const handleModelUpdate = async (modelData) => {
    try {
      if (brandFormMode === "add") {
        // 🚀 Caso: creando una marca nueva → actualizar localmente
        setSelectedBrand((prev) => {
          const updatedModels = (prev?.models || []).map((m) =>
            m.id_model === modelData.id_model ? { ...m, ...modelData } : m
          );
          return {
            ...prev,
            models: updatedModels,
          };
        });
      } else if (brandFormMode === "edit") {
        // 🚀 Caso: editando marca existente → actualizar en backend
        const response = await editModel(
          {
            name: modelData.modelName,
            description: modelData.description,
            responsible_user: id,
          },
          modelData.id
        );
        setModalMessage(response.message || "Modelo editado exitosamente");
        setSuccessOpen(true);

        // Refrescar desde backend
        const refreshedModels = await getModelsByBrand(selectedBrand.id);
        const normalizedModels = (refreshedModels || []).map((m) => ({
          id_model: m.id_model,
          modelName: m.name,
          description: m.description,
          isActive: m.estado === "1",
        }));

        setSelectedBrand((prev) => ({
          ...prev,
          models: normalizedModels,
        }));

        await fetchBrandsByCategory(selectedCategory.id);
      }

      handleModelModalClose();
    } catch (error) {
      setModalMessage(
        error.response.data.detail || "Ocurrio un error al editar el modelo"
      );
      setErrorOpen(true);
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
          <PermissionGuard permission={53}>
            <button
              onClick={() => handleViewDetails(info.getValue())}
              className="parametrization-action-button p-2 transition-colors lg:opacity-0 group-hover:opacity-100"
              title="Ver detalles"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </PermissionGuard>
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

        {/* Table */}
        <PermissionGuard permission={50}>
          <TableList
            columns={columns}
            data={data}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </PermissionGuard>
      </div>

      {/* CategoryModal - Modal de lista de brands */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        categoryId={selectedCategory?.id} // 👈 pásale el id
        categoryName={selectedCategory?.name} // 👈 pásale el nombre
        data={categoryBrands} // Aquí pasarías la lista de brands de la categoría seleccionada
        onAddItem={handleAddBrand} // Se ejecuta cuando se presiona "Add Brand"
        onEditItem={handleEditBrand} // Se ejecuta cuando se presiona "Edit" en la tabla
        refreshBrands={() => fetchBrandsByCategory(selectedCategory?.id)}
      />

      {/* BrandFormModal - Modal para agregar/editar brand */}
      <BrandFormModal
        isOpen={isBrandFormModalOpen}
        onClose={handleCloseBrandFormModal}
        mode={brandFormMode} // 'add' o 'edit'
        categoryName={selectedCategory?.name || ""}
        brandData={selectedBrand} // Datos del brand en modo edición
        onSave={handleSaveBrand} // Se ejecuta al guardar nuevo brand
        onUpdate={handleUpdateBrand} // Se ejecuta al actualizar brand existente
        onAddModel={handleAddModel} // Se ejecuta cuando se presiona "Add model"
        onEditModel={handleEditModel} // Se ejecuta cuando se presiona "Edit" en la tabla de modelos
        onStatusChanged={handleStatusChanged}
        onBrandDataChange={handleBrandDataChange} // Nuevo prop para sincronizar datos
      />

      {/* AddModifyModelModal - Modal para agregar/editar model */}
      <AddModifyModelModal
        isOpen={isModelModalOpen}
        onClose={handleModelModalClose}
        mode={modelModalMode} // 'add' o 'edit'
        brandName={selectedBrand?.brandName || ""}
        brandModels={selectedBrand?.models || []}
        modelData={selectedModelData} // Datos del model en modo edición
        onSave={handleModelSave} // Se ejecuta al guardar nuevo model
        onUpdate={handleModelUpdate} // Se ejecuta al actualizar model existente
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </div>
  );
};

export default ParameterizationView;
