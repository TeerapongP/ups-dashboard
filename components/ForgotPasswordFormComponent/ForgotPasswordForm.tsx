import { Activity, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"
import { useState } from "react"
import { Zap } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm() {
    const router = useRouter()

    const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleForgotPassword = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.username }),
            })
            if (!res.ok) throw new Error("Failed to send reset link")
            router.push("/auth/login")
        } catch (error) {
            console.log(error)
            alert("เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ต")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">UPS Monitoring</h1>
                    <p className="text-slate-300">ระบบตรวจสอบสถานะ UPS แบบเรียลไทม์</p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">

                    <div className="mb-6">
                        <button
                            onClick={() => router.push("/auth/login")}
                            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4 cursor-pointer"
                        >
                            <ArrowLeft size={20} className="mr-1" />
                            กลับไปหน้าเข้าสู่ระบบ
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">ลืมรหัสผ่าน</h2>
                        <p className="text-gray-600">โปรดกรอกชื่อผู้ใช้และรหัสผ่านใหม่เพื่อดำเนินการรีเซ็ตรหัสผ่านของคุณอย่างปลอดภัย</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                type="username"
                                id="reset-username"
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
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                     id="confirm-password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-black"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    รีเซ็ตรหัสผ่าน
                                </>
                            ) : (
                                'รีเซ็ตรหัสผ่าน'
                            )}
                        </button>
                    </div>

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
    )
}
