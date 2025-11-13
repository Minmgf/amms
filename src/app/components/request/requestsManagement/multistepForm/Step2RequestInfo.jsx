import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { BsFillFuelPumpFill } from "react-icons/bs";
import FuelPredictionModal from "./FuelPredictionModal";

export default function Step2RequestInfo({ 
  mode, 
  machineryOptions = [], 
  operatorOptions = [], 
  currencies = [],
  soilTypes = [],
  implementTypes=[],
  textureTypes=[],
  paymentMethods=[],
  paymentStatuses=[],
  setFuelPrediction, 
  fuelPrediction 
}) {
  const { register, setValue, getValues, watch, formState: { errors } } = useFormContext();
  const [selectError, setSelectError] = useState("");
  // leer lista persistida en el form (si está vacía devuelve [])
  const machineryList = watch("machineryList") || [];

  // estados locales efímeros (se perderían al desmontar) — guardar solo selección temporal si quieres
  const [selectedMachinery, setSelectedMachinery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  // Estados para el modal de predicción de combustible
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [predictionIdx, setPredictionIdx] = useState(null);

  // Sincronizar el select de monedas para que ambos se comporten como uno
  const watchedPaidCurrency = watch("amountPaidCurrency");
  // inicializar / sincronizar desde form o desde props currencies
  React.useEffect(() => {
    // 🔍 DEBUGGER AQUÍ: Ver qué valores tenemos

    
    // ✅ MEJOR: Usar id_units en vez de symbol
    const paidCurrency = getValues("amountPaidCurrency");
    const toBePaidCurrency = getValues("amountToBePaidCurrency");
    const defaultCurrency = currencies && currencies[0]?.id_units;
    const initialCurrency = paidCurrency || toBePaidCurrency || defaultCurrency || "";
    
    // ✅ Solo actualizar si realmente cambió
    if (initialCurrency && initialCurrency !== selectedCurrency) {
      setSelectedCurrency(initialCurrency);
      setValue("amountPaidCurrency", initialCurrency);
      setValue("amountToBePaidCurrency", initialCurrency);
    }
  }, [currencies, getValues]); // cuando lleguen las currencies
  
  // Si el formulario cambia el campo (p. ej. edición), reflejarlo
  React.useEffect(() => {
    if (watchedPaidCurrency && watchedPaidCurrency !== selectedCurrency) {
      setSelectedCurrency(watchedPaidCurrency);
    }
  }, [watchedPaidCurrency]);
  
  const handleCurrencyChange = (value) => {
    setSelectedCurrency(value);
    // mantener ambos campos sincronizados en react-hook-form
    setValue("amountPaidCurrency", value, { shouldValidate: false, shouldDirty: true });
    setValue("amountToBePaidCurrency", value, { shouldValidate: false, shouldDirty: true });
  };

  const handleAddMachinery = () => {
    if (!selectedMachinery || !selectedOperator) {
      setSelectError("Debes seleccionar maquinaria y operador.");
      return;
    }
    setSelectError(""); // limpia el error si todo está bien
    const machineryObj = machineryOptions.find(m => String(m.id_machinery ?? m.id) === String(selectedMachinery));
    const operatorObj = operatorOptions.find(o => String(o.id_user ?? o.id) === String(selectedOperator));
    if (!machineryObj || !operatorObj) return;
    const newList = [
      ...machineryList,
      { machinery: machineryObj, operator: operatorObj }
    ];
    // persistir en form
    setValue("machineryList", newList, { shouldValidate: false, shouldDirty: true });
    // reset seleccion
    setSelectedMachinery("");
    setSelectedOperator("");
  };

  const handleDelete = (idx) => {
    const newList = machineryList.filter((_, i) => i !== idx);
    setValue("machineryList", newList, { shouldValidate: false, shouldDirty: true });
  };

  const handleEdit = (idx) => {
    const item = machineryList[idx];
    setSelectedMachinery(String(item.machinery.id_machinery ?? item.machinery.id));
    setSelectedOperator(String(item.operator.id_user ?? item.operator.id));
    setEditIdx(idx);
  };

  const handleSaveEdit = () => {
    if (editIdx === null) return;
    const machineryObj = machineryOptions.find(m => String(m.id_machinery ?? m.id) === String(selectedMachinery));
    const operatorObj = operatorOptions.find(o => String(o.id_user ?? o.id) === String(selectedOperator));
    if (!machineryObj || !operatorObj) return;
    const updatedList = machineryList.map((it, i) => i === editIdx ? { machinery: machineryObj, operator: operatorObj } : it);
    setValue("machineryList", updatedList, { shouldValidate: false, shouldDirty: true });
    setSelectedMachinery("");
    setSelectedOperator("");
    setEditIdx(null);
  };

  return (
    <div>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información de la Solicitud
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-theme-sm text-secondary mb-1">Detalles de la solicitud</label>
          <textarea
            {...register("requestDetails",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            placeholder="Describa la solicitud..."
            aria-label="Detalles de la solicitud"
            rows={3}
            maxLength={500}
          />
          <span className="text-theme-xs text-secondary mt-1 block">
            {watch("requestDetails")?.length || 0}/500 caracteres
          </span>
          {errors.requestDetails && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.requestDetails.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Fecha de inicio programada</label>
          <input
            type="date"
            {...register("scheduledStartDate",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            aria-label="Fecha de inicio programada"
          />
          {errors.scheduledStartDate && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.scheduledStartDate.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Fecha de finalización</label>
          <input
            type="date"
            {...register("endDate",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            aria-label="Fecha de finalización"
          />
          {errors.endDate && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.endDate.message}
            </span>
          )}
        </div>
        {mode !== "preregister" && (
          <>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Método de pago</label>
              <select
                {...register("paymentMethod")}
                className="parametrization-input"
                aria-label="Método de pago"
              >
                <option value="">Seleccione...</option>
                {paymentMethods.map(pm => (
                  <option key={pm.code} value={pm.code}>{pm.name}</option>
                ))}
              </select>
              {errors.paymentMethod && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.paymentMethod.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Estado de pago</label>
              <select
                {...register("paymentStatus")}
                className="parametrization-input"
                aria-label="Estado de pago"
              >
                <option value="">Seleccione...</option>
                {paymentStatuses.map(status => (
                  <option key={status.id_statues} value={status.id_statues}>{status.name}</option>
                ))}
              </select>
              {errors.paymentStatus && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.paymentStatus.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Monto pagado</label>
              <div className="flex gap-2">
                <select
                  value={selectedCurrency}
                  onChange={e => handleCurrencyChange(e.target.value)}
                  className="parametrization-input"
                  aria-label="Moneda pagado"
                >
                  <option value="">Seleccione moneda...</option>
                  {currencies.map(cur => (
                    <option key={cur.id_units} value={cur.id_units}>{cur.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  {...register("amountPaid")}
                  className="parametrization-input"
                  placeholder="Ej: 100000"
                  aria-label="Monto pagado"
                />                
              </div>
              {errors.amountPaid && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.amountPaid.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Monto por pagar</label>
              <div className="flex gap-2">
                <select
                  value={selectedCurrency}
                  onChange={e => handleCurrencyChange(e.target.value)}
                  className="parametrization-input"
                  aria-label="Moneda por pagar"
                >
                  <option value="">Seleccione moneda...</option>
                  {currencies.map(cur => (
                    <option key={cur.id_units} value={cur.id_units}>{cur.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  {...register("amountToBePaid")}
                  className="parametrization-input"
                  placeholder="Ej: 50000"
                  aria-label="Monto por pagar"
                />                
              </div>
              {errors.amountToBePaid && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.amountToBePaid.message}
                </span>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-theme-sm text-secondary mb-1">Maquinaria disponible</label>
              <div className="flex gap-2">
                <select
                  value={selectedMachinery}
                  onChange={e => setSelectedMachinery(e.target.value)}
                  className="parametrization-input flex-1"
                  aria-label="Maquinaria disponible"
                >
                  <option value="">Seleccione...</option>
                  {machineryOptions.map(m => (
                    <option key={m.id_machinery} value={m.id_machinery}>
                      {m.machinery_name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedOperator}
                  onChange={e => setSelectedOperator(e.target.value)}
                  className="parametrization-input flex-1"
                  aria-label="Operador disponible"
                >
                  <option value="">Seleccione operador...</option>
                  {operatorOptions.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} {o.first_last_name} {o.second_last_name}
                    </option>
                  ))}
                </select>
                {editIdx === null ? (
                  <button
                    type="button"
                    className="btn-theme btn-primary px-4"
                    onClick={handleAddMachinery}
                    aria-label="Añadir maquinaria y operador"
                  >
                    Añadir
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-theme btn-success px-4"
                    onClick={handleSaveEdit}
                    aria-label="Guardar cambios de maquinaria y operador"
                    disabled={!selectedMachinery || !selectedOperator}
                  >
                    Guardar
                  </button>
                )}
              </div>
              {selectError && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {selectError}
                </span>
              )}
            </div>
            {/* Tabla persistida: leer de machineryList (form) */}
            {machineryList.length > 0 && (
              <div className="col-span-1 sm:col-span-2 mt-4">
                <table className="w-full text-theme-sm">
                  <thead>
                    <tr className="bg-surface">
                      <th className="py-2 px-2 text-left">Machine</th>
                      <th className="py-2 px-2 text-left">Serial Number</th>
                      <th className="py-2 px-2 text-left">Operator</th>
                      <th className="py-2 px-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineryList.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-2">{item.machinery?.machinery_name || "-"}</td>
                        <td className="py-2 px-2">{item.machinery?.serial_number || "-"}</td>
                        <td className="py-2 px-2">{item.operator?.name || "-"}</td>
                        <td className="py-2 px-2">
                          <button
                            title="Editar"
                            type="button"
                            className="btn-theme btn-secondary mr-2"
                            onClick={() => handleEdit(idx)}
                            aria-label="Editar maquinaria y operador"
                            disabled={editIdx !== null}
                          >
                            <FiEdit2 />
                            <span className="ml-1">Editar</span>
                          </button>
                          <button
                            title="Eliminar"
                            type="button"
                            className="btn-theme btn-error"
                            onClick={() => handleDelete(idx)}
                            aria-label="Eliminar maquinaria y operador"
                            disabled={editIdx !== null}
                          >
                            <FiTrash2 />
                            <span className="ml-1">Eliminar</span>
                          </button>
                          <button
                            title="Predicción de combustible"
                            type="button"
                            className="btn-theme btn-secondary ml-2"
                            onClick={() => {
                              setPredictionIdx(idx);
                              setPredictionOpen(true);
                            }}
                            aria-label="Abrir modal de predicción de combustible"
                          >
                            <BsFillFuelPumpFill />
                            <span className="ml-1">Predicción</span>                         
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <FuelPredictionModal
              isOpen={predictionOpen}
              onClose={() => setPredictionOpen(false)}
              onSave={data => {
                setFuelPrediction(prev => ({
                  ...prev,
                  [predictionIdx]: data
                }));
                setPredictionOpen(false);
              }}
              formData={fuelPrediction[predictionIdx]}
              soilTypes={soilTypes}
              implementTypes={implementTypes}
              textureTypes={textureTypes}
            />
          </>
        )}
      </div>
    </div>
  );
}