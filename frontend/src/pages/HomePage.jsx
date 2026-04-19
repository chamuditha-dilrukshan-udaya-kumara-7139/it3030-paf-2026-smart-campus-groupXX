import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import http from '../services/http';
import { createResource, deleteResource, updateResource } from '../services/api';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_FORM = {
  name: '', type: '', capacity: '', location: '',
  status: 'ACTIVE', description: '',
  availDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '08:00', endTime: '17:00',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VALIDATION — DEFAULT ERROR STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_ERRORS = {
  name:     '',
  type:     '',
  capacity: '',
  location: '',
  time:     '',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VALIDATION — RULES PER FIELD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const validate = (field, value, form) => {
  switch (field) {

    case 'name':
      if (!value?.trim())           return 'Resource name is required.';
      if (value.trim().length < 3)  return 'Name must be at least 3 characters.';
      if (value.trim().length > 80) return 'Name cannot exceed 80 characters.';
      return '';

    case 'type':
      if (!value) return 'Please select a resource type.';
      return '';

    case 'capacity': {
      const n = parseInt(value, 10);
      if (!value)           return 'Capacity is required.';
      if (isNaN(n) || n < 1) return 'Capacity must be at least 1.';
      if (n > 9999)          return 'Capacity cannot exceed 9,999.';
      return '';
    }

    case 'location':
      if (!value?.trim())          return 'Location is required.';
      if (value.trim().length < 2) return 'Please enter a more specific location.';
      return '';

    case 'time':
      if (form?.startTime && form?.endTime && form.endTime <= form.startTime)
        return 'End time must be after start time.';
      return '';

    default:
      return '';
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VALIDATION — ERROR DISPLAY (Field wrapper + red input style)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Field = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        ⚠ {error}
      </p>
    )}
  </div>
);

const inputCls = (hasError) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
    hasError
      ? 'border-red-400 focus:ring-red-300 bg-red-50'   // ← error state
      : 'border-slate-200 focus:ring-blue-500'           // ← normal state
  }`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fmtTime = t => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const buildAvail = (days, s, e) => {
  if (!days.length) return '';
  const label = days.length === 7 ? 'Daily'
    : days.length === 1 ? days[0]
    : `${days[0]}–${days.at(-1)}`;
  return `${label}: ${fmtTime(s)} – ${fmtTime(e)}`;
};

const statusBadge = s => ({
  ACTIVE:            'bg-green-100 text-green-700',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
  OUT_OF_SERVICE:    'bg-red-100 text-red-700',
}[s]);

const statusLabel = s => ({
  ACTIVE:            '● Available',
  UNDER_MAINTENANCE: '⚠ Maintenance',
  OUT_OF_SERVICE:    '✖ Out of Service',
}[s]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources]   = useState([]);
  const [showForm,  setShowForm]    = useState(false);
  const [selected,  setSelected]    = useState(null);
  const [form,      setForm]        = useState(DEFAULT_FORM);
  const [editingId, setEditingId]   = useState(null);
  const [saving,    setSaving]      = useState(false);
  const [filters,   setFilters]     = useState({ type: '', location: '', minCapacity: '' });

  // ── ✅ VALIDATION STATE ────────────────────────────────────────────────────
  const [errors, setErrors] = useState(DEFAULT_ERRORS);

  useEffect(() => { load(); }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const load = async (f = {}) => {
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
      const { data } = await http.get('/api/resources', { params });
      setResources(data);
    } catch (e) { console.error(e); }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ VALIDATION — TRIGGER 1: onChange (updates form + clears resolved errors)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const set = (name, value) => {
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (errors[name] !== undefined) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value, updated) }));
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ VALIDATION — TRIGGER 2: onBlur (validates single field when user leaves)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleBlur = (field, value) => {
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ VALIDATION — TRIGGER 3: Time cross-check (start vs end time)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleTimeChange = (key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    setErrors(prev => ({ ...prev, time: validate('time', null, updated) }));
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ VALIDATION — TRIGGER 4: validateAll (runs on form submit)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const validateAll = () => {
    const newErrors = {
      name:     validate('name',     form.name),
      type:     validate('type',     form.type),
      capacity: validate('capacity', form.capacity),
      location: validate('location', form.location),
      time:     validate('time',     null, form),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(msg => msg === ''); // true = no errors
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ VALIDATION — TRIGGER 5: Block submit if invalid
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateAll()) return; // ← stops here if any field has an error

    setSaving(true);
    const payload = {
      name:                form.name.trim(),
      type:                form.type,
      location:            form.location.trim(),
      capacity:            parseInt(form.capacity, 10),
      status:              form.status,
      description:         form.description.trim(),
      availabilityWindows: [buildAvail(form.availDays, form.startTime, form.endTime)].filter(Boolean),
    };
    try {
      editingId ? await updateResource(editingId, payload) : await createResource(payload);
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setErrors(DEFAULT_ERRORS);
      setEditingId(null);
      load();
    } catch (err) {
      alert('Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FORM HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const openForm = (res = null) => {
    setForm(res ? {
      name: res.name, type: res.type, capacity: String(res.capacity),
      location: res.location, status: res.status || 'ACTIVE',
      description: res.description || '',
      availDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '08:00', endTime: '17:00',
    } : DEFAULT_FORM);
    setErrors(DEFAULT_ERRORS);
    setEditingId(res?.id || null);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this resource?')) return;
    try { await deleteResource(id); load(); } catch (e) { console.error(e); }
  };

  const toggleDay = d => set('availDays',
    form.availDays.includes(d)
      ? form.availDays.filter(x => x !== d)
      : [...form.availDays, d].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
  );

  const availPreview = buildAvail(form.availDays, form.startTime, form.endTime);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex justify-between items-center p-8 bg-white border-b shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Facilities & Assets</h2>
            <p className="text-sm text-slate-500">Manage campus resources and infrastructure</p>
          </div>
          {isAdmin && (
            <button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md">
              + Add Resource
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-8">

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Filter Resources</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Type</label>
                <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm min-w-[140px]"
                  value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                  <option value="">All Types</option>
                  {['Hall', 'Lab', 'Equipment'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Location</label>
                <input className="px-3 py-2 rounded-lg border border-slate-200 text-sm min-w-[160px]"
                  placeholder="e.g. Block A" value={filters.location}
                  onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Min Capacity</label>
                <input type="number" min="1" className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-[120px]"
                  placeholder="e.g. 30" value={filters.minCapacity}
                  onChange={e => setFilters(f => ({ ...f, minCapacity: e.target.value }))} />
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => { setFilters({ type: '', location: '', minCapacity: '' }); load(); }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50">
                  Clear
                </button>
                <button onClick={() => load(filters)}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  {['Resource Details', 'Type', 'Capacity', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 font-medium border-b">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No resources found.
                    </td>
                  </tr>
                ) : (
                  resources.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(res)}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{res.name}</div>
                        <div className="text-[11px] text-slate-400 uppercase">{res.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">{res.type}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{res.capacity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(res.status)}`}>
                          {statusLabel(res.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                        {isAdmin ? (
                          <div className="flex justify-center gap-3">
                            <button onClick={() => openForm(res)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                            <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete</button>
                          </div>
                        ) : (
                          <button onClick={() => setSelected(res)} className="text-slate-500 hover:text-blue-600 text-sm font-semibold">View Info</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ── FORM MODAL ─────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {editingId ? 'Update' : 'Create'} Resource
            </h2>
            <p className="text-sm text-slate-400 mb-6">Fields marked * are required</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* ✅ VALIDATED FIELD — Name */}
              <Field label="Resource Name *" error={errors.name}>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  onBlur={e => handleBlur('name', e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  maxLength={80}
                  className={inputCls(errors.name)}
                />
                <p className="text-right text-xs text-slate-400">{form.name.length}/80</p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                {/* ✅ VALIDATED FIELD — Type */}
                <Field label="Type *" error={errors.type}>
                  <select
                    value={form.type}
                    onChange={e => set('type', e.target.value)}
                    onBlur={e => handleBlur('type', e.target.value)}
                    className={`${inputCls(errors.type)} bg-white`}
                  >
                    <option value="">Select type</option>
                    {['Hall', 'Lab', 'Equipment'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>

                {/* ✅ VALIDATED FIELD — Capacity */}
                <Field label="Capacity *" error={errors.capacity}>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e => set('capacity', e.target.value)}
                    onBlur={e => handleBlur('capacity', e.target.value)}
                    placeholder="e.g. 80"
                    min="1" max="9999"
                    className={inputCls(errors.capacity)}
                  />
                </Field>
              </div>

              {/* ✅ VALIDATED FIELD — Location */}
              <Field label="Location *" error={errors.location}>
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  onBlur={e => handleBlur('location', e.target.value)}
                  placeholder="e.g. Block A, Floor 2"
                  className={inputCls(errors.location)}
                />
              </Field>

              {/* Status (no validation needed) */}
              <Field label="Operating Status">
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="ACTIVE">Active (available)</option>
                  <option value="UNDER_MAINTENANCE">Under maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of service</option>
                </select>
              </Field>

              {/* ✅ VALIDATED SECTION — Availability (day chips + time range) */}
              <div className="space-y-3 border border-slate-100 rounded-xl p-4 bg-slate-50">
                <label className="text-xs font-bold text-slate-500 uppercase block">Availability Window</label>

                {/* Day selector */}
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        form.availDays.includes(d)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>

                {/* ✅ VALIDATED — Time range (cross-field check) */}
                <div className="grid grid-cols-2 gap-4">
                  {[['startTime', 'Start time'], ['endTime', 'End time']].map(([key, lbl]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-slate-500">{lbl}</label>
                      <input
                        type="time"
                        value={form[key]}
                        onChange={e => handleTimeChange(key, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                          errors.time && key === 'endTime'
                            ? 'border-red-400 focus:ring-red-300'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                {errors.time && <p className="text-xs text-red-500">⚠ {errors.time}</p>}

                {/* Live preview of availability string */}
                {availPreview && (
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                    {availPreview}
                  </span>
                )}
              </div>

              {/* Description (optional, no validation) */}
              <Field label="Description (optional)">
                <input
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  maxLength={160}
                  placeholder="Brief notes about this resource"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-right text-xs text-slate-400">{form.description.length}/160</p>
              </Field>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 font-semibold disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ──────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-6 text-white relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">×</button>
              <div className="text-xs font-bold text-blue-400 uppercase mb-1">{selected.type}</div>
              <h2 className="text-2xl font-bold">{selected.name}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[['Location', selected.location], ['Capacity', `${selected.capacity} Seats`]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">{lbl}</label>
                    <p className="text-slate-700 font-medium">{val}</p>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Operating Hours</label>
                <div className="flex flex-wrap gap-2">
                  {selected.availabilityWindows?.length > 0
                    ? selected.availabilityWindows.map((w, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">{w}</span>
                      ))
                    : <span className="text-slate-400 text-xs italic">Flexible hours</span>}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selected.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-bold text-slate-700 text-sm">{selected.status}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}