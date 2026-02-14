"use client";

/** Props from DB: only show card when we have at least name or phone */
export interface EmergencyContactFromDb {
  name?: string | null;
  relationship?: string | null;
  phone?: string | null;
}

interface EmergencyContactCardProps {
  contact: EmergencyContactFromDb | null | undefined;
}

function formatPhoneForLink(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function EmergencyContactCard({ contact }: EmergencyContactCardProps) {
  if (!contact) return null;
  const name = contact.name?.trim() || null;
  const relationship = contact.relationship?.trim() || null;
  const phone = contact.phone?.trim() || null;
  const hasAny = name || phone;
  if (!hasAny) return null;

  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "—";

  const handleCall = () => {
    if (phone) window.location.href = `tel:${formatPhoneForLink(phone)}`;
  };

  const handleWhatsApp = () => {
    if (phone) window.open(`https://wa.me/${formatPhoneForLink(phone)}`, "_blank");
  };

  return (
    <section
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
      aria-labelledby="emergency-contact-heading"
    >
      <h2
        id="emergency-contact-heading"
        className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sky-500 text-base" aria-hidden="true">
          family_restroom
        </span>
        Emergency Contact
      </h2>

      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          {name && <p className="font-semibold text-slate-900">{name}</p>}
          {relationship && <p className="text-sm text-slate-500">{relationship}</p>}
        </div>
      </div>

      {phone && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCall}
            className="flex flex-col items-center justify-center py-3 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-slate-500 group-hover:text-sky-500 mb-1 transition-colors" aria-hidden="true">
              call
            </span>
            <span className="text-xs font-medium text-slate-600">Call</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center py-3 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-emerald-500 group-hover:text-emerald-600 mb-1 transition-colors" aria-hidden="true">
              chat
            </span>
            <span className="text-xs font-medium text-emerald-700">WhatsApp</span>
          </button>
        </div>
      )}
    </section>
  );
}
