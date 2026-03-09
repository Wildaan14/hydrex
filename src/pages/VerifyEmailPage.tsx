import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Email berhasil diverifikasi! Silakan login.");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Gagal memverifikasi email.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Terjadi kesalahan jaringan.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-900">{message}</h2>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sukses!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Ke Halaman Login
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Validasi Gagal</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/register")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Kembali ke Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
