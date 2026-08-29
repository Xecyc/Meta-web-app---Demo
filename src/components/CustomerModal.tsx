import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Building2, Check, ShieldCheck, Mail } from 'lucide-react';
import { CustomerProfile, DocumentType, Branch } from '../types';
import { BRANCHES } from '../data/products';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  onSaveProfile: (profile: CustomerProfile) => void;
}

// Utility to format phone numbers automatically: 0424-6398347
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
};

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [docType, setDocType] = useState<DocumentType>(profile.documentType || 'V');
  const [docNumber, setDocNumber] = useState(profile.documentNumber || '');
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [phone, setPhone] = useState(profile.phone ? formatPhoneNumber(profile.phone) : '');
  const [email, setEmail] = useState(profile.email || '');
  const [address, setAddress] = useState(profile.address || '');
  const [branch, setBranch] = useState(profile.preferredBranch || BRANCHES[0].id);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setDocType(profile.documentType || 'V');
    setDocNumber(profile.documentNumber || '');
    setFullName(profile.fullName || '');
    setPhone(profile.phone ? formatPhoneNumber(profile.phone) : '');
    setEmail(profile.email || '');
    setAddress(profile.address || '');
    setBranch(profile.preferredBranch || BRANCHES[0].id);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerProfile = {
      documentType: docType,
      documentNumber: docNumber.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      preferredBranch: branch,
    };

    onSaveProfile(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        id="customer-modal-card"
        className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1e33] to-[#0f2b48] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-heading">Perfil y Datos de Facturación</h3>
              <p className="text-xs text-slate-300">
                Información para facturación legal y despacho express de tus pedidos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body: Multi-column grid on desktop */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document ID (Cédula / RIF) */}
            <div>
              <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
                Documento de Identidad (Cédula / RIF) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="customer-doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-18 px-3 py-2 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-center cursor-pointer"
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                  <option value="G">G</option>
                </select>
                <input
                  id="customer-doc-number"
                  type="text"
                  required
                  placeholder="Ej. 24890123"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
                Nombre Completo o Razón Social <span className="text-red-500">*</span>
              </label>
              <input
                id="customer-fullname"
                type="text"
                required
                placeholder="Ej. Carlos Mendoza"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
              />
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="customer-phone"
                  type="tel"
                  required
                  placeholder="0424-6398347"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
                Correo Electrónico (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Preferred Branch */}
          <div>
            <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
              Sede Principal de Preferencia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                id="customer-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-extrabold text-[#0f2b48] uppercase tracking-wider mb-1.5">
              Dirección Habitual de Entrega (Para Despacho Express)
            </label>
            <div className="relative">
              <textarea
                id="customer-address"
                rows={2}
                placeholder="Sector, calle, edificio/casa, punto de referencia o instrucciones para el repartidor..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Tus datos se guardan de forma segura en este navegador para agilizar tus compras futuras en Supertiendas Meta.</span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-customer"
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {showSavedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Datos Guardados!</span>
                </>
              ) : (
                <span>Guardar y Continuar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
