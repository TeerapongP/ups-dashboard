import { useRouter } from "next/navigation";
import React from "react";
import Cookies from 'js-cookie';

export default function NavBar() {
    const router = useRouter();


    return (
        <header className="sticky top-0 z-10 bg-white shadow-md">
            <div className="max-w-full px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">UPS Monitoring Dashboard</h1>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600 font-semibold">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

}