"use client";

interface AccessMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessMatrixModal({ isOpen, onClose }: AccessMatrixModalProps) {
  if (!isOpen) return null;

  const roles = [
    "Super Admin",
    "Operations Admin",
    "Finance Admin",
    "Compliance Admin",
    "Support Lead",
  ];

  const permissions = [
    {
      module: "Cluster & Infrastructure Config",
      superAdmin: true,
      operations: false,
      finance: false,
      compliance: false,
      support: false,
      note: "Full root access & WAF whitelisting",
    },
    {
      module: "Admin Role Promotion & Delegation",
      superAdmin: true,
      operations: false,
      finance: false,
      compliance: false,
      support: false,
      note: "Secondary co-signoff mandatory",
    },
    {
      module: "Financial Payouts (> $50K)",
      superAdmin: true,
      operations: false,
      finance: true,
      compliance: false,
      support: false,
      note: "Dual-signoff between Super & Finance Admin",
    },
    {
      module: "Merchant Onboarding & Table Layouts",
      superAdmin: true,
      operations: true,
      finance: false,
      compliance: false,
      support: false,
      note: "Floorplan verification & active shift dispatch",
    },
    {
      module: "Food Hygiene & Trade License Audits",
      superAdmin: true,
      operations: false,
      finance: false,
      compliance: true,
      support: false,
      note: "Halal status & health inspection certificates",
    },
    {
      module: "Customer Booking Dispute Triage",
      superAdmin: true,
      operations: true,
      finance: false,
      compliance: false,
      support: true,
      note: "Direct patron complaint resolution & fee waive",
    },
    {
      module: "Cryptographic Audit Stream (Read)",
      superAdmin: true,
      operations: true,
      finance: true,
      compliance: true,
      support: false,
      note: "Write-once cold storage logs",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-xl border border-outline-variant flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            <div>
              <h3 className="font-headline-sm text-xl font-bold text-primary">
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-xs text-on-surface-variant">
                Enforced privilege separation across The Maple &amp; Vine operations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px] border-b border-outline-variant">
                <th className="py-3 px-4 font-bold">Privilege & Governance Scope</th>
                <th className="py-3 px-3 text-center font-bold text-primary">Super Admin</th>
                <th className="py-3 px-3 text-center font-bold">Operations</th>
                <th className="py-3 px-3 text-center font-bold">Finance</th>
                <th className="py-3 px-3 text-center font-bold">Compliance</th>
                <th className="py-3 px-3 text-center font-bold">Support Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {permissions.map((p) => (
                <tr key={p.module} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4">
                    <span className="font-bold text-on-surface block">{p.module}</span>
                    <span className="text-[10px] text-on-surface-variant">{p.note}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.superAdmin ? (
                      <span className="material-symbols-outlined text-primary text-lg font-bold">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        remove
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.operations ? (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        remove
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.finance ? (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        remove
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.compliance ? (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        remove
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.support ? (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        remove
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security Summary Box */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-start gap-3 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
            lock_reset
          </span>
          <div>
            <span className="font-bold text-primary block mb-0.5">
              Dual-Approval Security Invariant
            </span>
            <span>
              Elevating any administrative account to Super Admin status or modifying bank settlement
              payout batches requires a cryptographic co-signature from another registered Super
              Administrator within 15 minutes.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-bold text-xs hover:opacity-95 cursor-pointer shadow-2xs"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
