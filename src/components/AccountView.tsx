import React from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  Pencil
} from 'lucide-react';
import { CustomerProfile, Branch } from '../types';
import { BRANCHES } from '../data/products';

interface AccountViewProps {
  profile: CustomerProfile;
  onEditProfile: () => void;
  selectedBranch: Branch;
  onSelectBranch: (b: Branch) => void;
  exchangeRate?: number;
}

export const AccountView: React.FC<AccountViewProps> = ({
  profile,
  onEditProfile,
  selectedBranch,
  onSelectBranch,
}) => {
  // Determine avatar initial and fallback display values
  const displayName = profile.fullName.trim() || 'jesus';
  const displayInitial = profile.fullName.trim()
    ? profile.fullName.trim().charAt(0).toUpperCase()
    : 'J';
  const displayDocument = profile.documentNumber
    ? `${profile.documentType}-${profile.documentNumber}`
    : 'V-Sin registrar';

  const formatDisplayPhone = (phoneStr?: string) => {
    if (!phoneStr || !phoneStr.trim()) return 'No registrado';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length > 4 && !phoneStr.includes('-')) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
    }
    return phoneStr;
  };

  return (
    <div id="account-view-container" className="max-w-3xl mx-auto py-3 sm:py-5 space-y-5">
      {/* 1. Profile Information Section */}
      <div className="space-y-3">
        {/* Header Card */}
        <div 
          id="profile-header-card" 
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* User Avatar */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0f2b48] text-white flex items-center justify-center text-xl font-bold font-heading shadow-sm shrink-0">
              {displayInitial || <User className="w-6 h-6" />}
            </div>

            {/* User Meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Registrado
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Cédula / RIF: <span className="text-slate-700 font-semibold">{displayDocument}</span>
              </p>
            </div>
          </div>

          {/* Sleek Compact Pencil Edit Button */}
          <button
            id="btn-edit-profile-account"
            onClick={onEditProfile}
            title="Editar datos del perfil"
            aria-label="Editar datos"
            className="p-2 sm:p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 cursor-pointer"
          >
            <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Personal Details List (Unified White Card Container) */}
        <div 
          id="profile-details-card" 
          className="rounded-2xl p-4 bg-white shadow-sm border border-slate-200/80 divide-y divide-slate-100"
        >
          {/* Teléfono */}
          <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Teléfono
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {formatDisplayPhone(profile.phone)}
              </span>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Correo Electrónico
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {profile.email || 'No registrado'}
              </span>
            </div>
          </div>

          {/* Dirección de Entrega */}
          <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Dirección de Entrega
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {profile.address || 'No registrada'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Store Directory ("Nuestras Sucursales") */}
      <div className="space-y-3">
        {/* Section Header */}
        <div className="px-1">
          <h3 className="text-base font-extrabold text-slate-900 font-heading">
            Nuestras Sucursales
          </h3>
          <p className="text-xs text-slate-500">
            Selecciona tu tienda para cambiar de sede.
          </p>
        </div>

        {/* Store Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRANCHES.map((b) => {
            const isActive = selectedBranch.id === b.id;

            return (
              <div
                key={b.id}
                id={`store-card-${b.id}`}
                onClick={() => onSelectBranch(b)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-white border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                }`}
              >
                {/* Store Header & Info */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-slate-900">
                    {b.name}
                  </h4>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{b.address}</span>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.hours}</span>
                  </div>
                </div>

                {/* Interactive Status / Button (No green WhatsApp block or phone) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Sede Activa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBranch(b);
                      }}
                      className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Seleccionar Sede
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Central Support Card ("Atención al Cliente") */}
      <div 
        id="central-support-card"
        className="bg-[#0f2b48] text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold font-heading text-white">
            Atención al Cliente y Soporte
          </h4>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            ¿Tienes dudas con tu pedido o métodos de pago? Contáctanos directamente a nuestra línea de atención central.
          </p>
        </div>

        <a
          id="btn-whatsapp-support"
          href="https://wa.me/584246398347?text=Hola%20Supertiendas%20Meta,%20necesito%20asistencia%20con%20mi%20cuenta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Escribir a Soporte por WhatsApp</span>
        </a>
      </div>

      {/* 4. Clean Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-400">
        <p>Supertiendas Meta C.A. • Tu supermercado de confianza en Maracaibo y San Francisco</p>
      </div>
    </div>
  );
};

