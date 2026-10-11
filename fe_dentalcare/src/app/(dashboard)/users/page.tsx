"use client";

import * as React from "react";
import {
  UserCog,
  ShieldCheck,
  Stethoscope,
  Activity,
  Pill,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Phone,
  Mail,
  BadgeCheck,
  LayoutGrid,
  List,
  Lock,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useUsers } from "@/hooks";
import { User, RoleType } from "@/types";
import { toast } from "sonner";

interface RoleOption {
  code: RoleType;
  title: string;
  description: string;
  icon: React.ElementType;
  badgeClass: string;
  bgLight: string;
  textClass: string;
  borderClass: string;
}

const AVAILABLE_ROLES: RoleOption[] = [
  {
    code: "super_admin",
    title: "Super Admin",
    description: "Akses penuh konfigurasi sistem, data master, laporan, dan manajemen pengguna.",
    icon: ShieldCheck,
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    bgLight: "bg-purple-500",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "hover:border-purple-500 border-slate-200 dark:border-slate-800",
  },
  {
    code: "doctor",
    title: "Dokter Gigi",
    description: "Akses odontogram interaktif, SOAP rekam medis, diagnosis ICD-10, dan peresepan.",
    icon: Stethoscope,
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    bgLight: "bg-teal-500",
    textClass: "text-teal-600 dark:text-teal-400",
    borderClass: "hover:border-teal-500 border-slate-200 dark:border-slate-800",
  },
  {
    code: "nurse",
    title: "Perawat Gigi",
    description: "Akses registrasi pasien baru, pemanggilan antrean live chair, dan input triase.",
    icon: Activity,
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    bgLight: "bg-sky-500",
    textClass: "text-sky-600 dark:text-sky-400",
    borderClass: "hover:border-sky-500 border-slate-200 dark:border-slate-800",
  },
  {
    code: "pharmacist",
    title: "Petugas Farmasi",
    description: "Akses dispensasi resep obat, manajemen inventaris obat, dan mutasi stok apotek.",
    icon: Pill,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    bgLight: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "hover:border-emerald-500 border-slate-200 dark:border-slate-800",
  },
];

export default function UsersPage() {
  const { users, loading, createUser, updateUser, deleteUser, toggleStatus } = useUsers();

  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<"card" | "table">("card");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);

  // Form Fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<RoleType>("doctor");
  const [phone, setPhone] = React.useState("");
  const [employeeNumber, setEmployeeNumber] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Copy Email state helper
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

  // Metrics calculation
  const total = users.length;
  const superAdminCount = users.filter((u) => u.role === "super_admin" || (u as any).role === "admin").length;
  const doctorCount = users.filter((u) => u.role === "doctor" || (u as any).role === "dokter").length;
  const nurseCount = users.filter((u) => u.role === "nurse" || (u as any).role === "perawat").length;
  const pharmacistCount = users.filter((u) => u.role === "pharmacist" || (u as any).role === "farmasi" || (u as any).role === "receptionist").length;

  // Filtered users
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      if (filterRole) {
        if (filterRole === "doctor" && u.role !== "doctor" && (u as any).role !== "dokter") return false;
        if (filterRole === "nurse" && u.role !== "nurse" && (u as any).role !== "perawat") return false;
        if (filterRole === "pharmacist" && u.role !== "pharmacist" && (u as any).role !== "farmasi") return false;
        if (filterRole === "super_admin" && u.role !== "super_admin") return false;
      }
      if (filterStatus !== "") {
        const activeBool = filterStatus === "true";
        if (u.isActive !== activeBool) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        const matchEmp = u.employeeNumber?.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchEmp;
      }
      return true;
    });
  }, [users, filterRole, filterStatus, search]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole("doctor");
    setPhone("");
    setEmployeeNumber("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Leave blank if no change
    setShowPassword(false);
    const standardRole =
      user.role === ("dokter" as any)
        ? "doctor"
        : user.role === ("perawat" as any)
        ? "nurse"
        : user.role === ("farmasi" as any)
        ? "pharmacist"
        : user.role;
    setRole(standardRole || "doctor");
    setPhone(user.phone || "");
    setEmployeeNumber(user.employeeNumber || "");
    setIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama lengkap pengguna wajib diisi!");
      return;
    }
    if (!email.trim()) {
      toast.error("Alamat email pengguna wajib diisi!");
      return;
    }
    if (modalMode === "create" && (!password || password.length < 6)) {
      toast.error("Kata sandi minimal 6 karakter!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        await createUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          phone: phone.trim(),
          employeeNumber: employeeNumber.trim(),
          isActive,
        });
        toast.success(`Pengguna ${name} berhasil dibuat! Akun siap digunakan untuk login.`);
      } else if (editingUserId) {
        await updateUser(editingUserId, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone.trim(),
          employeeNumber: employeeNumber.trim(),
          isActive,
          ...(password && password.length >= 6 ? { password } : {}),
        });
        toast.success(`Data pengguna ${name} berhasil diperbarui.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data pengguna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatus(user.id);
      toast.success(
        `Akun ${user.name} berhasil ${user.isActive ? "dinonaktifkan" : "diaktifkan"}!`
      );
    } catch {
      toast.error("Gagal mengubah status pengguna.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await deleteUser(deletingUser.id);
      toast.success(`Pengguna ${deletingUser.name} berhasil dihapus.`);
      setIsDeleteOpen(false);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pengguna.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyEmail = (userEmail: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(userEmail);
      setCopiedEmail(userEmail);
      toast.success(`Email ${userEmail} disalin ke clipboard!`);
      setTimeout(() => setCopiedEmail(null), 2500);
    }
  };

  const getRoleBadge = (userRole: string) => {
    const matched = AVAILABLE_ROLES.find(
      (r) =>
        r.code === userRole ||
        (r.code === "doctor" && userRole === "dokter") ||
        (r.code === "nurse" && userRole === "perawat") ||
        (r.code === "pharmacist" && (userRole === "farmasi" || userRole === "receptionist"))
    );

    if (matched) {
      const Icon = matched.icon;
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${matched.badgeClass}`}
        >
          <Icon className="h-3 w-3" />
          <span>{matched.title}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <UserIcon className="h-3 w-3" />
        <span>{userRole}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Pengguna & Hak Akses (User CRUD)"
        description="Kelola akun pengguna klinik gigi terintegrasi JWT Laravel: Super Admin, Dokter Gigi, Perawat, dan Farmasi untuk otentikasi login sistem."
      >
        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengguna Baru</span>
        </Button>
      </PageHeader>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <StatCard title="Total Pengguna" value={total} />
        <StatCard title="Super Admin" value={superAdminCount} iconColor="text-purple-600" />
        <StatCard title="Dokter Gigi" value={doctorCount} iconColor="text-teal-600" />
        <StatCard title="Perawat Gigi" value={nurseCount} iconColor="text-sky-600" />
        <StatCard title="Petugas Farmasi" value={pharmacistCount} iconColor="text-emerald-600" />
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, NIP..."
              className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <span className="font-semibold text-slate-400 hidden sm:inline">|</span>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Hak Akses Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="doctor">Dokter Gigi</option>
            <option value="nurse">Perawat Gigi</option>
            <option value="pharmacist">Petugas Farmasi</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>

          {(search || filterRole || filterStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterRole("");
                setFilterStatus("");
              }}
              className="h-8 text-xs text-rose-600 hover:bg-rose-50"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-800">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === "card"
                ? "bg-white text-teal-700 font-semibold shadow-xs dark:bg-slate-900 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Card</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-teal-700 font-semibold shadow-xs dark:bg-slate-900 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Users List (Card Mode) */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all ${
                !user.isActive
                  ? "border-slate-200 bg-slate-50/60 opacity-75 dark:border-slate-800 dark:bg-slate-900/40"
                  : "border-slate-200 bg-white hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div>
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-sm shadow-xs dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 shrink-0">
                      {user.name.replace(/^(drg\.|Ns\.|Apt\.|apt\.)\s*/i, "").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {user.employeeNumber || `ID-${user.id}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Role / Hak Akses:</span>
                    {getRoleBadge(user.role)}
                  </div>

                  {/* Email with copy button */}
                  <div className="flex items-center justify-between gap-1 rounded-xl bg-slate-50 p-2 text-[11px] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Mail className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {user.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(user.email)}
                      className="p-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer rounded-md"
                      title="Salin Email untuk Login"
                    >
                      {copiedEmail === user.email ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Phone */}
                  {user.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 px-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(user)}
                  className="flex-1 h-7 text-xs gap-1 border-slate-200 hover:border-teal-400"
                >
                  <Edit3 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Edit Data</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleStatus(user)}
                  className={`h-7 px-2 text-xs ${
                    user.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={user.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                >
                  {user.isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDeletingUser(user);
                    setIsDeleteOpen(true);
                  }}
                  className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50"
                  title="Hapus Pengguna"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Pengguna</th>
                <th className="px-4 py-3">Email Login</th>
                <th className="px-4 py-3">Role / Hak Akses</th>
                <th className="px-4 py-3">NIP / Karyawan</th>
                <th className="px-4 py-3">No. Telepon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{user.email}</span>
                      <button
                        onClick={() => handleCopyEmail(user.email)}
                        className="text-slate-400 hover:text-teal-600 p-0.5"
                        title="Salin Email"
                      >
                        {copiedEmail === user.email ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {user.employeeNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => handleOpenEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 px-2 text-[11px] ${
                        user.isActive ? "text-amber-600" : "text-emerald-600"
                      }`}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[11px] text-rose-600"
                      onClick={() => {
                        setDeletingUser(user);
                        setIsDeleteOpen(true);
                      }}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
            <UserCog className="h-6 w-6" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Tidak ada pengguna ditemukan
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Coba ubah kata kunci pencarian atau reset filter untuk melihat daftar pengguna klinik gigi.
          </p>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="mt-4 gap-1.5 bg-teal-600 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pengguna Baru</span>
          </Button>
        </div>
      )}

      {/* Modal Tambah / Edit Pengguna */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={modalMode === "create" ? "Tambah Pengguna Baru (User Baru)" : "Edit Data Pengguna"}
        description={
          modalMode === "create"
            ? "Daftarkan akun staf klinik dengan role super admin, dokter, perawat, atau farmasi untuk digunakan login ke sistem."
            : "Perbarui informasi profil pengguna, hak akses role, status akun, atau kata sandi."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          {/* Role Picker Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Role / Hak Akses <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.code;
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => setRole(r.code)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20 dark:bg-teal-950/40 dark:border-teal-500"
                        : "border-slate-200 hover:border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isSelected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: drg. Amanda Putri, Sp.Ort atau Ns. Rini, S.Kep"
              required
            />
          </div>

          {/* Email Login */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Pengguna (Digunakan untuk Login) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama.user@dentalcare.local"
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {modalMode === "create" ? "Kata Sandi Akun" : "Kata Sandi Baru (Opsional)"}{" "}
                {modalMode === "create" && <span className="text-rose-500">*</span>}
              </label>
              {modalMode === "edit" && (
                <span className="text-[10px] text-slate-400">Kosongkan jika tidak diubah</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modalMode === "create" ? "Minimal 6 karakter" : "Masukkan kata sandi baru..."}
                className="pl-9 pr-9"
                required={modalMode === "create"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Grid: Phone and Employee Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nomor Telepon / WhatsApp
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                NIP / Nomor Karyawan
              </label>
              <Input
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="DOC-0004 / Otomatis"
              />
            </div>
          </div>

          {/* Status Akun Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Status Akun Aktif</p>
              <p className="text-[11px] text-slate-400">
                Hanya akun aktif yang diizinkan untuk login ke sistem
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              isLoading={isSubmitting}
            >
              {modalMode === "create" ? "Simpan & Buat Akun" : "Perbarui Akun"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Hapus Akun Pengguna?"
        description={`Apakah Anda yakin ingin menghapus akun ${deletingUser?.name} (${deletingUser?.email})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Pengguna"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
