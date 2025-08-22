import React from 'react'

const page = () => {
    return (
        <div
            className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/images/singup-background.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 bg-black/60 text-white rounded-lg shadow-lg w-full max-w-3xl p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm">Identification</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Identification type</label>
                        <select className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">Select</option>
                            <option value="cc">C.C</option>
                            <option value="ti">T.I</option>
                            <option value="ce">C.E</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">First & Middle name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">
                            Last name & Second last name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">E-mail</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Phone number</label>
                        <input
                            type="tel"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-lg font-semibold transition duration-300"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default page