"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getPermissions, createRole } from "@/services/roleService";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";

const Page = () => {
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getPermissions();
        setPermissions(data);
        const uniqueCategories = [...new Set(data.map((p) => p.category))];
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (err) {
        
      }
    };
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = permissions.filter(
        (p) => p.category === selectedCategory
      );
      setFilteredPermissions(filtered);
    }
  }, [selectedCategory, permissions]);

  const handleCheckboxChange = (id) => {
    setSelectedPermissions((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const countSelectedInCategory = (cat) =>
    permissions.filter(
      (p) => p.category === cat && selectedPermissions.has(p.id)
    ).length;

  const resetPermissions = () => {
    setSelectedPermissions(new Set());
  };

  const onSubmit = async (data) => {
    if (selectedPermissions.size === 0) {
      setModalMessage("You must select at least one permission");
      setErrorOpen(true);
      return;
    }

    const roleData = {
      name: data.name,
      description: data.description,
      permissions: Array.from(selectedPermissions),
    };
    setLoading(true);
    try {
      const response = await createRole(roleData);

      if (response && response.id) {
        setModalMessage("Role created successfully");
        setSuccessOpen(true);
        reset(); 
        resetPermissions();
      } else {
        setModalMessage("Unexpected response from server");
        setErrorOpen(true);
      }
    } catch (error) {
      setModalMessage(error.response?.data?.detail || "Unexpected error");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }

  };

  return (
    <>
      <div className="flex gap-3 bg-white">
        <main className="w-full flex justify-center items-start py-10 px-4 bg-[#F1F1F1]">
          <div className="w-full max-w-6xl bg-[#ffffff] rounded-2xl shadow p-8 border border-blue-400">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <button className="text-neutral-600 hover:text-black text-xl">←</button>
              <h1 className="text-2xl font-bold text-black">Create New Role</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                  {/* Role Name */}
                  <div className="flex flex-col">
                    <label className="font-bold text-sm text-neutral-700">
                      Role Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter role name"
                      className="border text-[#282828] rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 placeholder-[#999999]"
                      {...register("name", { required: "Role name is required" })}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Permissions categories */}
                  <div className="flex flex-col">
                    <label className="font-semibold text-sm text-neutral-700">
                      Permissions categories
                    </label>
                    <select
                      className="border rounded-md px-3 py-2 mt-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-neutral-500 mt-2">
                      Select a category above to configure its specific permissions
                    </p>
                  </div>
                </div>

                {/* Role Description */}
                <div className="flex flex-col">
                  <label className="font-semibold text-sm text-neutral-700">
                    Role Description
                  </label>
                  <textarea
                    maxLength={200}
                    className="border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
                    {...register("description", {
                      required: "Role description is required",
                    })}
                  />
                  <p className="text-xs text-neutral-500 mt-1 text-right">
                    {/* react-hook-form controla el valor */}
                  </p>
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Permission Section */}
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* Left side: permissions table */}
                <div className="flex flex-col gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] items-center px-4 py-2 font-semibold bg-[#F8F8F8] text-neutral-700 border-b">
                      <span>Permission Name</span>
                      <span></span>
                    </div>
                    {filteredPermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className={`grid grid-cols-[1fr_auto] items-center px-4 py-2 border-b last:border-b-0 ${
                          selectedPermissions.has(perm.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <span>{perm.description}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedPermissions.has(perm.id)}
                          onChange={() => handleCheckboxChange(perm.id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <span className="h-2 w-2 rounded-full bg-blue-500 inline-block"></span>
                    Currently configuring:
                    <span className="font-medium text-blue-600">{selectedCategory}</span>
                    <span className="ml-2">
                      Active permissions:{" "}
                      <b>{countSelectedInCategory(selectedCategory)}</b> of{" "}
                      <b>{filteredPermissions.length}</b>
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetPermissions}
                      className="px-6 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    >
                      Reset All
                    </button>
                  </div>
                </div>

                {/* Right side: categories summary */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="shadow-sm rounded-lg p-3 text-sm text-neutral-700 bg-neutral-50 border"
                    >
                      <div className="flex flex-col items-center justify-between">
                        <span>{cat}</span>
                        <span className="text-xs text-neutral-500">
                          {countSelectedInCategory(cat)}/
                          {permissions.filter((p) => p.category === cat).length} active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end mt-6 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    resetPermissions();
                  }}
                  className="px-8 py-2 font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-2 font-semibold rounded-lg text-white transition 
                    ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"}`}
                >
                  {loading ? "Creating..." : "Create Role"}
                </button>

              </div>
            </form>
          </div>
        </main>
      </div>
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

export default Page;
