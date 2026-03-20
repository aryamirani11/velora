import { motion } from 'framer-motion';
import {
  Activity, Heart, Weight, Pill, FlaskConical, Target, CheckCircle2, Circle,
  TrendingUp, Minus, Stethoscope, Phone, Clock, Bot, AlertCircle, Shield
} from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export default function DashboardPanel({ patient, timeline }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-2.5 auto-rows-min"
    >
      {/* Patient Info */}
      <motion.div variants={item} className="col-span-3 bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-velora-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {patient.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">{patient.name}</h2>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              patient.statusColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
              patient.statusColor === 'amber' ? 'bg-amber-500/10 text-amber-600' :
              'bg-red-500/10 text-red-600'
            }`}>{patient.status}</span>
          </div>
          <p className="text-[11px] text-slate-400">{patient.age}y {patient.gender} • {patient.condition} — {patient.subtype}</p>
        </div>
        {patient.allergies.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-red-400">
            <AlertCircle size={10} />
            <span>Allergies: {patient.allergies.join(', ')}</span>
          </div>
        )}
      </motion.div>

      {/* Vitals */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Vitals</h3>
        <div className="space-y-2">
          {[
            { icon: Activity, label: 'BP', value: patient.vitals.bp, color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: Heart, label: 'HR', value: `${patient.vitals.hr} bpm`, color: 'text-pink-500', bg: 'bg-pink-50' },
            { icon: Weight, label: 'Weight', value: `${patient.vitals.weight} kg`, color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map(v => (
            <div key={v.label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${v.bg} flex items-center justify-center`}>
                <v.icon size={11} className={v.color} />
              </div>
              <span className="text-[10px] text-slate-400 w-10">{v.label}</span>
              <span className="text-xs font-semibold text-slate-700">{v.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Medications */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Medications</h3>
        <div className="space-y-1.5">
          {patient.medications.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <Pill size={10} className="text-teal-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-700">{m.name}</span>
                <span className="text-[10px] text-slate-400 ml-1">{m.dose}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Labs */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Lab Results</h3>
        <div className="space-y-1.5">
          {patient.labs.map((l, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{l.name}</span>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-semibold ${l.flag ? 'text-amber-600' : 'text-slate-700'}`}>{l.value}</span>
                <span className="text-[9px] text-slate-400">{l.unit}</span>
                {l.flag && <TrendingUp size={9} className="text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Care Goals */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Care Goals</h3>
        <div className="space-y-2">
          {patient.goals.map((g, i) => (
            <div key={i}>
              <div className="flex items-center gap-1.5 mb-0.5">
                {g.met ?
                  <CheckCircle2 size={11} className="text-emerald-500" /> :
                  <Circle size={11} className="text-slate-300" />
                }
                <span className="text-[11px] font-medium text-slate-700">{g.name}</span>
              </div>
              <div className="ml-4">
                <div className="text-[9px] text-slate-400 mb-0.5">{g.current} / {g.target}</div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 * i }}
                    className={`h-full rounded-full ${g.met ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Care Team */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Care Team</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Stethoscope size={12} className="text-velora-500" />
            <div>
              <div className="text-[10px] text-slate-400">Provider</div>
              <div className="text-[11px] font-medium text-slate-700">{patient.careTeam.provider}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-0.5"><Phone size={8} />{patient.careTeam.providerPhone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-pink-500" />
            <div>
              <div className="text-[10px] text-slate-400">Emergency</div>
              <div className="text-[11px] font-medium text-slate-700">{patient.careTeam.emergency}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-0.5"><Phone size={8} />{patient.careTeam.emergencyPhone}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={item} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
        <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Timeline</h3>
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center py-3 text-slate-300">
            <Clock size={16} className="mb-1" />
            <p className="text-[10px]">Run a demo to see events</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {timeline.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-velora-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={8} className="text-velora-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">{e.text}</p>
                  <p className="text-[9px] text-slate-300">{e.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
