import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  Briefcase,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';

export const WorkersManager: React.FC = () => {
  const { users, activeUser, isAdmin, addUser, updateUser, deleteUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [jobTitle, setJobTitle] = useState('فني تغيير زيوت وغسيل');
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('0000');
  const [dailyWage, setDailyWage] = useState<number>(250);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visible PINs map
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  const togglePinVisibility = (id: string) => {
    setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setRole('cashier');
    setJobTitle('فني غسيل وتغيير زيوت');
    setPhone('');
    setPinCode('0000');
    setDailyWage(250);
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setJobTitle(user.jobTitle || 'عامل / فني');
    setPhone(user.phone || '');
    setPinCode(user.pinCode || '0000');
    setDailyWage(user.dailyWage || 0);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم العامل.');
      return;
    }
    if (!pinCode || pinCode.length < 4) {
      alert('يرجى إدخال رمز PIN مكون من 4 أرقام على الأقل لسرعة تسجيل الدخول.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser({
          ...editingUser,
          name: name.trim(),
          role,
          jobTitle: jobTitle.trim(),
          phone: phone.trim(),
          pinCode: pinCode.trim(),
          dailyWage: dailyWage || 0,
        });
        alert('تم تعديل بيانات العامل بنجاح!');
      } else {
        await addUser({
          name: name.trim(),
          role,
          jobTitle: jobTitle.trim(),
          phone: phone.trim(),
          pinCode: pinCode.trim(),
          dailyWage: dailyWage || 0,
        });
        alert(`تمت إضافة العامل "${name.trim()}" بنجاح! يمكنه الآن العمل واستلام الورديات.`);
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ بيانات العامل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (user.id === activeUser.id) {
      alert('لا يمكنك حذف الحساب النشط حالياً!');
      return;
    }
    if (user.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('لا يمكن حذف المالك الأساسي للنظام!');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف العامل "${user.name}"؟`)) {
      const ok = await deleteUser(user.id);
      if (ok) {
        alert('تم حذف العامل بنجاح.');
      } else {
        alert('تعذر حذف العامل.');
      }
    }
  };

  // If active user is not the Owner
  if (!isAdmin) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-2">صلاحية خاصة بمالك المغسلة فقط</h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          عذراً، هذه الصفحة مخصصة لمالك المغسلة (Owner) فقط لإضافة وإدارة بيانات العمال والفنيين والرواتب. يرجى التبديل لحساب المالك من القائمة العلوية.
        </p>
      </div>
    );
  }

  const workersCount = users.filter((u) => u.role === 'cashier').length;
  const ownersCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>لوحة تحكم صاحب المغسلة (Owner Control)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            إدارة فريق العمل والعمال
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            أضف فنيين وعمال غسيل وتغيير زيوت جدد، حدد رموز الدخول السريعة (PIN)، وتابع طاقم عمل المغسلة بسهولة.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عامل / فني جديد 👷</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي فريق العمل</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {users.length} <span className="text-xs text-slate-400">فرد</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">العمال والفنيين النشطين</span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {workersCount} <span className="text-xs text-slate-400">عامل / كاشير</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">الملاك والمدراء</span>
            <div className="text-2xl font-black text-purple-700 font-mono">
              {ownersCount} <span className="text-xs text-slate-400">مالك / شريك</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Workers Cards & Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">قائمة أفراد فريق العمل والعمال المسجلين</h2>
          <span className="text-xs text-slate-400">يمكن لأي عامل تسجيل الدخول باستخدام اسمه ورمز الـ PIN الخاص به</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">اسم الفرد</th>
                <th className="py-3 px-4 text-center">نوع الصلاحية</th>
                <th className="py-3 px-4">المسمى والوظيفة</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4 text-center">رمز الدخول (PIN)</th>
                <th className="py-3 px-4 text-left">اليومية المقدرة</th>
                <th className="py-3 px-4 text-center">إجراءات المالك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isOwner = u.role === 'admin';
                const isCurrent = u.id === activeUser.id;
                const showPin = visiblePins[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            isOwner
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {u.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                الحساب الحالي
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {u.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4 text-center">
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px]">
                          <Shield className="w-3 h-3 text-purple-600" />
                          المالك / مدير 👑
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-black text-[11px]">
                          عامل / فني 👷
                        </span>
                      )}
                    </td>

                    {/* Job Title */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {u.jobTitle || (isOwner ? 'المدير العام' : 'فني تغيير زيوت وغسيل')}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.phone || 'غير مسجل'}
                    </td>

                    {/* PIN Code with toggle */}
                    <td className="py-3 px-4 text-center font-mono">
                      <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-800 tracking-wider">
                          {showPin ? u.pinCode : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                          title={showPin ? 'إخفاء PIN' : 'إظهار PIN'}
                        >
                          {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Wage */}
                    <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                      {u.dailyWage ? `${u.dailyWage} ج.م` : '---'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="تعديل بيانات العامل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isOwner && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="حذف العامل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Worker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingUser ? 'تعديل بيانات العامل' : 'إضافة عامل / فني جديد للفريق'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    خاص بصاحب المغسلة لإنشاء حسابات العاملين وتعيين مهامهم
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم العامل بالكامل <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="مثال: حسام الدين محمود"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الصلاحية:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="cashier">عامل / كاشير (تشغيلي بدون أرباح)</option>
                    <option value="admin">مالك / شريك (صلاحيات كاملة وأرباح)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    placeholder="فني غيار زيوت وفلاتر، كاشير..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    placeholder="010xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    رمز الدخول السريع (PIN / الكود) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1234 أو 857487487"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اليومية المقدرة للعامل (ج.م):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="250 ج.م"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ...' : editingUser ? 'حفظ التعديلات' : 'تأكيد إضافة العامل 👷'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
