import { motion } from 'framer-motion';
import { HeartPulse, Activity, Droplets, ChevronRight } from 'lucide-react';
import { conditionGroups, patients } from '../data/patients';

const icons = {
  "heart-pulse": HeartPulse,
  "activity": Activity,
  "droplets": Droplets,
};

const statusColors = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export default function PatientList({ selectedId, onSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-0">
      <div className="px-3 py-2.5 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Patients</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{Object.keys(patients).length} active patients</p>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {conditionGroups.map(group => {
          const Icon = icons[group.icon];
          return (
            <div key={group.condition} className="mb-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Icon size={12} style={{ color: group.color }} />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {group.condition}
                </span>
                <span className="text-[10px] text-slate-300 ml-auto">{group.patients.length}</span>
              </div>
              {group.patients.map(pid => {
                const p = patients[pid];
                const isSelected = pid === selectedId;
                return (
                  <motion.button
                    key={pid}
                    onClick={() => onSelect(pid)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-velora-50 border-r-2 border-velora-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-br from-velora-500 to-teal-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium truncate ${
                          isSelected ? 'text-velora-700' : 'text-slate-700'
                        }`}>
                          {p.name}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[p.statusColor]}`} />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{p.age}y • {p.subtype}</p>
                    </div>
                    {isSelected && <ChevronRight size={12} className="text-velora-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
