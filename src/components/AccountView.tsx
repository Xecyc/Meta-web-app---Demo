import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Radio,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CustomerProfile, Branch } from '../types';
import { BRANCHES } from '../data/products';
import { formatVeCurrency, parseVeCurrency, formatLiveInput } from '../utils/currency';
import { formatBcvDate, formatRelativeTime } from '../services/dolarApi';

interface AccountViewProps {
  profile: CustomerProfile;
  onEditProfile: () => void;
  onResetProfile: () => void;
  selectedBranch: Branch;
  onSelectBranch: (b: Branch) => void;
  exchangeRate: number;
  onRefreshRate?: () => void;
  isRefreshingRate?: boolean;
  lastUpdatedApi?: string | null;
  lastFetchedLocal?: string | null;
  isAutoUpdated?: boolean;
  onToggleAutoUpdate?: (enabled: boolean) => void;
  onManualUpdateRate?: (newRate: number) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  profile,
  onEditProfile,
  onResetProfile,
  selectedBranch,
  onSelectBranch,
  exchangeRate,
  onRefreshRate,
  isRefreshingRate = false,
  lastUpdatedApi,
  lastFetchedLocal,
  isAutoUpdated = true,
  onToggleAutoUpdate,
  onManualUpdateRate,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditingCustomRate, setIsEditingCustomRate] = useState(false);
  const [customRateInput, setCustomRateInput] = useState(() => formatVeCurrency(exchangeRate));

  // Check if profile actually has registered data
  const hasProfileData = Boolean(
    profile.fullName.trim() || 
    profile.documentNumber.trim() || 
    profile.phone.trim() || 
    profile.email?.trim() || 
    profile.address.trim()
  );

  // Determine avatar initial and fallback display values
  const displayName = profile.fullName.trim() || 'Sin registrar';
  const displayInitial = profile.fullName.trim()
    ? profile.fullName.trim().charAt(0).toUpperCase()
    : 'U';
  const displayDocument = profile.documentNumber
    ? `${profile.documentType}-${profile.documentNumber}`
    : 'Sin registrar';

  const formatDisplayPhone = (phoneStr?: string) => {
    if (!phoneStr || !phoneStr.trim()) return 'No registrado';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length > 4 && !phoneStr.includes('-')) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
    }
    return phoneStr;
  };

  const handleConfirmReset = () => {
    onResetProfile();
    setShowConfirmDelete(false);
  };

  const handleSaveCustomRate = () => {
    const parsed = parseVeCurrency(customRateInput);
    if (parsed > 0 && onManualUpdateRate) {
      onManualUpdateRate(parsed);
      setIsEditingCustomRate(false);
    }
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
                {hasProfileData ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Registrado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Sin datos
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Cédula / RIF: <span className="text-slate-700 font-semibold">{displayDocument}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit and Remove Profile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-edit-profile-account"
              onClick={onEditProfile}
              title="Editar datos del perfil"
              aria-label="Editar datos"
              className="p-2 sm:p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 cursor-pointer"
            >
              <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
            {hasProfileData && (
              <button
                id="btn-remove-profile-account"
                onClick={() => setShowConfirmDelete(true)}
                title="Eliminar cuenta registrada (Demo)"
                aria-label="Eliminar datos de cuenta"
                className="p-2 sm:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Alert if triggered */}
        {showConfirmDelete && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900">
                  ¿Eliminar los datos de la cuenta registrada?
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Se limpiarán todos los datos personales para volver al estado inicial del demo.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete-account"
                onClick={handleConfirmReset}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Sí, eliminar cuenta
              </button>
            </div>
          </div>
        )}

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

        {/* Demo Helper / Reset account pill button */}
        {hasProfileData && !showConfirmDelete && (
          <div className="flex justify-end px-1">
            <button
              id="btn-demo-clear-account"
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-red-50/70 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar cuenta registrada (para demo)</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Tasa de Cambio BCV - DolarAPI Venezuela Integration Card */}
      <div className="space-y-3" id="bcv-rate-settings-section">
        <div className="px-1">
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <span>Tasa de Cambio Oficial (BCV)</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              DolarAPI Venezuela
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Actualización automática de precios en Bolívares (Bsd) según la tasa oficial publicada por el Banco Central de Venezuela.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          {/* Main Rate Highlight */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Tasa Activa del Catálogo</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                $1 USD = <span className="text-[#c8102e]">{formatVeCurrency(exchangeRate)}</span> Bsd
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {lastUpdatedApi && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Publicación BCV: <strong className="text-slate-700">{formatBcvDate(lastUpdatedApi)}</strong>
                  </span>
                )}
                {lastFetchedLocal && (
                  <span className="text-slate-400">• Sincronizado {formatRelativeTime(lastFetchedLocal)}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {onRefreshRate && (
                <button
                  type="button"
                  id="btn-sync-bcv-rate"
                  onClick={onRefreshRate}
                  disabled={isRefreshingRate}
                  className="px-3.5 py-2 bg-[#0f2b48] hover:bg-[#163b61] active:bg-[#0a1e33] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isRefreshingRate ? 'Sincronizando...' : 'Actualizar Tasa'}</span>
                </button>
              )}

              {onManualUpdateRate && (
                <button
                  type="button"
                  id="btn-toggle-manual-rate"
                  onClick={() => {
                    setIsEditingCustomRate(!isEditingCustomRate);
                    setCustomRateInput(formatVeCurrency(exchangeRate));
                  }}
                  className="p-2 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Ajustar tasa manualmente"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Manual Rate Edit Form (if toggled) */}
          {isEditingCustomRate && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Ajuste manual de tasa (Bsd por $1 USD):</span>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomRate(false)}
                  className="text-amber-700 hover:text-amber-900 text-[11px]"
                >
                  Cancelar
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="input-custom-exchange-rate"
                  type="text"
                  inputMode="decimal"
                  value={customRateInput}
                  onChange={(e) => setCustomRateInput(formatLiveInput(e.target.value))}
                  placeholder="Ej. 798,33"
                  className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  id="btn-save-custom-rate"
                  onClick={handleSaveCustomRate}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}

          {/* Auto-Sync Toggle Row */}
          {onToggleAutoUpdate && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">
                  Actualización automática en segundo plano
                </span>
                <span className="text-[11px] text-slate-500">
                  Consulta periódicamente la API oficial de DolarAPI para mantener los precios exactos.
                </span>
              </div>
              <button
                type="button"
                id="toggle-auto-sync-rate-btn"
                onClick={() => onToggleAutoUpdate(!isAutoUpdated)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAutoUpdated ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAutoUpdated ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Store Directory ("Nuestras Sucursales") */}
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

      {/* 4. Central Support Card ("Atención al Cliente") */}
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
          href="https://wa.me/584246398347?text=Hola%20SuperTienda,%20necesito%20asistencia%20con%20mi%20cuenta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Escribir a Soporte por WhatsApp</span>
        </a>
      </div>

      {/* 5. Clean Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-400">
        <p>SuperTienda • Catálogo digital y compras en línea</p>
      </div>
    </div>
  );
};

