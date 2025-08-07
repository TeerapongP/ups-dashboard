"use client";
import { useState } from 'react';
import { Eye, EyeOff, Zap, Shield, Activity } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Simulate API call
        setTimeout(() => {
            if (formData.username && formData.password) {
                setMessage('เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทางไปยัง Dashboard...');
            } else {
                setMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Simulate API call
        setTimeout(() => {
            if (formData.username) {
                setMessage('ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว');
            } else {
                setMessage('กรุณากรอกอีเมลที่ถูกต้อง');
            }
            setIsLoading(false);
        }, 1500);
    };
    return <div>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

            <div className="w-full max-w-md relative">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">UPS Monitoring</h1>
                    <p className="text-slate-300">ระบบตรวจสอบสถานะ UPS แบบเรียลไทม์</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
                            <p className="text-gray-600">กรอกข้อมูลเพื่อเข้าสู่ระบบ Dashboard</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อผู้ใช้
                                </label>
                                <input
                                    type="username"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-black"
                                    placeholder="kukps"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสผ่าน
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-black"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                                        จำรหัสผ่าน
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push("/auth/forgot-password")}
                                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                >
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        กำลังเข้าสู่ระบบ...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5 mr-2" />
                                        เข้าสู่ระบบ
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                    {/* {message && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('สำเร็จ') || message.includes('ส่งไปยัง')
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )} */}
                </div>


                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="text-white/80">
                        <Activity className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Real-time</p>
                    </div>
                    <div className="text-white/80">
                        <Shield className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Secure</p>
                    </div>
                    <div className="text-white/80">
                        <Zap className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">Monitoring</p>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}