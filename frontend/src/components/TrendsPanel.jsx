import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export default function TrendsPanel({ patient }) {
  const [activeChart, setActiveChart] = useState('bp');
  const charts = [
    { key: 'bp', label: 'Blood Pressure', color: '#0ea5e9' },
    { key: 'hr', label: 'Heart Rate', color: '#ec4899' },
    { key: 'wt', label: 'Weight', color: '#14b8a6' },
  ];

  const latestVital = patient.vitalHistory[patient.vitalHistory.length - 1];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-2.5"
    >
      {/* Main chart */}
      <motion.div variants={item} className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-800">Vital Trends — {patient.name}</h3>
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {charts.map(c => (
              <button
                key={c.key}
                onClick={() => setActiveChart(c.key)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  activeChart === c.key
                    ? 'bg-white shadow-sm text-slate-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-52 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={patient.vitalHistory}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={charts.find(c => c.key === activeChart).color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={charts.find(c => c.key === activeChart).color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#94a5b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a5b8' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke={charts.find(c => c.key === activeChart).color}
                fill="url(#chartGrad)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Stat cards */}
      {[
        { label: 'Blood Pressure', value: `${latestVital.bp}`, unit: 'mmHg', color: 'velora' },
        { label: 'Heart Rate', value: `${latestVital.hr}`, unit: 'bpm', color: 'pink' },
        { label: 'Weight', value: `${latestVital.wt}`, unit: 'kg', color: 'teal' },
        { label: 'SpO2', value: `${patient.vitals.spo2}`, unit: '%', color: 'emerald' },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          variants={item}
          className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 text-center"
        >
          <div className="text-[10px] text-slate-400 mb-1">{s.label}</div>
          <div className="text-xl font-bold text-slate-800">{s.value}</div>
          <div className="text-[10px] text-slate-400">{s.unit}</div>
        </motion.div>
      ))}

      {/* Recent history table */}
      <motion.div variants={item} className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-semibold text-slate-800 mb-2">Recent Readings</h3>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-slate-400 border-b border-slate-100">
              <th className="text-left py-1.5 font-medium">Date</th>
              <th className="text-right py-1.5 font-medium">BP</th>
              <th className="text-right py-1.5 font-medium">HR</th>
              <th className="text-right py-1.5 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody>
            {[...patient.vitalHistory].reverse().slice(0, 5).map((v, i) => (
              <tr key={i} className="text-[11px] border-b border-slate-50">
                <td className="py-1.5 text-slate-500">{v.d}</td>
                <td className="py-1.5 text-right font-medium text-slate-700">{v.bp}</td>
                <td className="py-1.5 text-right font-medium text-slate-700">{v.hr}</td>
                <td className="py-1.5 text-right font-medium text-slate-700">{v.wt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
