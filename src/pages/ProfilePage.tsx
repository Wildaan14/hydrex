// pages/ProfilePage.tsx
import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Building2, Calendar, Edit, Camera, Award, Droplets, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Kredit Air", value: "12,450 m³", icon: <Droplets className="w-5 h-5" /> },
    { label: "Transaksi", value: "45", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: "Sertifikat", value: "12", icon: <Award className="w-5 h-5" /> },
  ];

  // FIX: Use optional chaining and provide defaults for phone and address
  // These properties may not exist on the User type, so we access them safely
  const userPhone = (user as any)?.phone || "Belum diisi";
  const userAddress = (user as any)?.address || "Belum diisi";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                user?.role === "admin" ? "bg-purple-500/10 text-purple-500" :
                user?.role === "company" ? "bg-blue-500/10 text-blue-500" :
                "bg-emerald-500/10 text-emerald-500"
              }`}>
                {user?.role === "admin" ? "Administrator" : user?.role === "company" ? "Perusahaan" : "Individual"}
              </span>
              <span className="text-sm text-muted-foreground">
                Bergabung sejak {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profil
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                {stat.icon}
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Informasi Pribadi</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Telepon</p>
              {/* FIX: Use the safely accessed phone value */}
              <p className="text-foreground">{userPhone}</p>
            </div>
          </div>
          {user?.company && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Perusahaan</p>
                <p className="text-foreground">{user.company}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Alamat</p>
              {/* FIX: Use the safely accessed address value */}
              <p className="text-foreground">{userAddress}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
