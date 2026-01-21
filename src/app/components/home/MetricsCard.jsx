"use client";

import { icon } from "leaflet";
import { FaTractor } from "react-icons/fa";

export default function MetricsCard({
    title = "Maquinarias Operativas",
    value = 0,
    icon: Icon = FaTractor
}) {
    return (
        <div className="card-theme">
            <div className="flex items-center justify-between m-2">

                    <div>
                        <h4 className="my-2 font-bold text-gray-800 text-3xl">
                            {value}
                        </h4>
                        <span className="text-sm text-gray-500">
                            {title}
                        </span>
                    </div>
                <div className="flex items-center justify-center w-12 h-12 bg-hover rounded-xl">
                    <Icon/>
                </div>
            </div>
        </div>
    )
}