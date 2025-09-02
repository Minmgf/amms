"use client";
import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Se ha enviado el enlace de recuperación a: " + email);
  };

  return (
    <div className="w-full flex gap-3 bg-white">
      {/* navigation */}
      <div className="w-[24%] bg-white"></div>

      {/* NEW ROL */}
      <main className="w-full flex justify-center items-start py-10 px-4 bg-[#F1F1F1]">
        <div className="w-full max-w-5xl bg-[#ffffff] rounded-2xl shadow p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button className="text-neutral-600 hover:text-black">←</button>
            <h1 className="text-2xl font-bold text-black">Create New Role</h1>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="flex flex-col">
                {/* Role Name */}
                <div className="flex flex-col">
                  <label className="font-bold text-sm text-red-600">
                    Role Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter role name"
                    className="border border-red-400 text-[#282828] rounded-xl px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-[#999999]"
                  />
                  <p className="text-xs text-red-600 mt-1">
                    Please enter a name for the new role
                  </p>
                </div>{" "}
                \{/* Permissions categories */}
                <div className="flex flex-col">
                  <label className="font-semibold text-sm text-neutral-700">
                    Permissions categories
                  </label>
                  <select className="border rounded-lg px-3 py-2 mt-2 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Machinery</option>
                    <option>Payroll</option>
                    <option>Request</option>
                    <option>Ai</option>
                    <option>Monitoring</option>
                    <option>Parameterization</option>
                    <option>User Management</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    Select a category above to configure its specific
                    permissions
                  </p>
                </div>
              </div>

              {/* Role Description */}
              <div className="flex flex-col">
                <label className="font-semibold text-sm text-neutral-700">
                  Role Description
                </label>
                <textarea
                  placeholder=""
                  className="border-3 border-[#D7D7D7] text-black rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:border-[#D7D7D7] h-28"
                />
              </div>
            </div>

            {/* Permission */}
            <div className="grid grid-cols-7 gap-7">
              <div className="col-span-4 flex flex-col">
                <div className="border rounded-lg">
                  <div className="grid grid-cols-[1fr_auto] items-center rounded-t-lg px-4 py-2 font-medium bg-[#787880]">
                    <span>Permission Name</span>
                    <span></span>
                  </div>
                  {["Example", "Example", "Example", "Example"].map(
                    (perm, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto] items-center px-4 py-2 border-b last:border-b-0"
                      >
                        <span>{perm}</span>
                        <input type="checkbox" className="h-4 w-4" />
                      </div>
                    )
                  )}
                </div>

                {/* Permissions list */}
                <div className="col-span-2 bg-[#F9F9F9] px-8 py-4">
                  {/* Footer info */}
                  <div className="flex justify-between items-center gap-2 text-sm text-neutral-600">
                    <div className="flex gap-1">
                      <div>
                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block mr-1"></span>
                        Currently configuring:
                      </div>
                      <span className="font-medium text-blue-600">
                        Machinery
                      </span>
                    </div>

                    <span className="ml-2">
                      Active permissions: <b>0</b> of <b>4</b>
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-5 py-3 rounded-lg bg-[#787880]/12 text-black hover:bg-neutral-100"
                    >
                      Reset All
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg shadow bg-[#007AFF] text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Side categories */}
              <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Machinery",
                  "Payroll",
                  "Request",
                  "Ai",
                  "Monitoring",
                  "Parameterization",
                  "User Management",
                ].map((cat) => (
                  <div
                    key={cat}
                    className="shadow-md rounded-xl px-4 py-5 text-sm text-neutral-700 bg-white"
                  >
                    <div className="flex flex-col items-start justify-between">
                      <span className="font-semibold text-black">{cat}</span>
                      <span className="text-xs text-black">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-2 h-2 rounded-lg shadow bg-[#CCCCCC] text-white hover:bg-neutral-500"></div>
                          0/4 active
                        </div>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex justify-end">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-8 py-2 font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 font-semibold rounded-lg bg-black text-white hover:bg-neutral-800"
                >
                  Create Role
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default page;
