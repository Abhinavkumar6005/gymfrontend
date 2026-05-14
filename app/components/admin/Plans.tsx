'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
  clearError,
  clearSuccessMessage,
  clearSelectedPlan,
  fetchPlanById,
} from '../../../store/Slices/PlansSlice';
import type { Plan } from '../../../store/Slices/PlansSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanFormData = Omit<Plan, '_id' | 'createdAt'>;

const initialForm: PlanFormData = {
  name: '',
  durationMonths: 1,
  price: 0,
  description: '',
  features: [],
  isActive: true,
};

type ModalMode = 'create' | 'edit' | null;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Plans() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    plans,
    selectedPlan,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.plans);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [form, setForm] = useState<PlanFormData>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [search, setSearch] = useState('');

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Sync form if background fetchPlanById returns fresher data.
  // Only fires when selectedPlan changes AND matches the plan being edited.
  useEffect(() => {
    if (selectedPlan && modalMode === 'edit' && selectedPlan._id === editingId) {
      setForm({
        name: selectedPlan.name,
        durationMonths: selectedPlan.durationMonths,
        price: selectedPlan.price,
        description: selectedPlan.description ?? '',
        features: [...selectedPlan.features],
        isActive: selectedPlan.isActive,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]);

  // Close modal + reset on success
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      closeModal();
    }
  }, [successMessage, dispatch]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const closeModal = () => {
    setModalMode(null);
    setForm(initialForm);
    setFeatureInput('');
    setEditingId(null);
    dispatch(clearSelectedPlan());
  };

  const openCreate = () => {
    setForm(initialForm);
    setFeatureInput('');
    setModalMode('create');
  };

  const openEdit = (plan: Plan) => {
    setEditingId(plan._id);
    // ✅ Populate form immediately from the plan already in Redux state
    // so the modal shows data right away without waiting for the API round-trip.
    setForm({
      name: plan.name,
      durationMonths: plan.durationMonths,
      price: plan.price,
      description: plan.description ?? '',
      features: [...plan.features],
      isActive: plan.isActive,
    });
    setFeatureInput('');
    setModalMode('edit');
    // Still dispatch fetchPlanById in the background so selectedPlan
    // gets the freshest server data — the useEffect below will sync
    // only if something actually changed.
    dispatch(fetchPlanById(plan._id));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'durationMonths' || name === 'price'
          ? Number(value)
          : value,
    }));
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addFeature(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      dispatch(createPlan(form));
    } else if (modalMode === 'edit' && editingId) {
      dispatch(updatePlan({ id: editingId, planData: form }));
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deletePlan(id));
    setDeleteConfirm(null);
  };

  const filtered = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const durationLabel = (months: number) =>
    months === 1 ? '1 Month' : `${months} Months`;

  const isBusy = isCreating || isUpdating;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Inputs ── */
        .plans-input {
          width: 100%; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1);
          color: #fff; padding: 0.75rem 1rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          outline: none; transition: border-color 0.2s; border-radius: 2px;
        }
        .plans-input:focus { border-color: #C8F542; }
        .plans-input::placeholder { color: #444; }
        .plans-input option { background: #111; }

        textarea.plans-input { resize: vertical; min-height: 80px; }

        .form-label {
          font-family: 'DM Sans', sans-serif; font-size: 0.7rem;
          letter-spacing: 2px; text-transform: uppercase; color: #555;
          display: block; margin-bottom: 0.4rem;
        }

        /* ── Buttons ── */
        .btn-primary {
          background: #C8F542; color: #000; border: none;
          padding: 0.75rem 1.5rem; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 0.8rem; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer; transition: opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent; color: #666; border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1.5rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #fff; color: #fff; }

        .btn-edit {
          background: transparent; color: #888; border: 1px solid rgba(255,255,255,0.1);
          padding: 0.4rem 0.85rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; margin-right: 0.5rem;
        }
        .btn-edit:hover { border-color: #C8F542; color: #C8F542; }

        .btn-danger {
          background: transparent; color: #ff6b6b; border: 1px solid rgba(255,107,107,0.3);
          padding: 0.4rem 0.85rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-danger:hover { background: rgba(255,107,107,0.1); }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-icon {
          background: rgba(200,245,66,0.1); color: #C8F542; border: 1px solid rgba(200,245,66,0.2);
          padding: 0.4rem 0.75rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .btn-icon:hover { background: rgba(200,245,66,0.2); }

        /* ── Table rows ── */
        .plan-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 160px;
          gap: 1rem; align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          transition: background 0.2s;
        }
        .plan-row:hover { background: rgba(255,255,255,0.02); }

        /* ── Status badge ── */
        .status-badge {
          display: inline-block; padding: 0.25rem 0.6rem;
          font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;
          font-weight: 500; border-radius: 2px;
        }

        /* ── Features tags ── */
        .feature-tag {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: rgba(200,245,66,0.08); border: 1px solid rgba(200,245,66,0.15);
          color: #C8F542; padding: 0.25rem 0.6rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          border-radius: 2px; margin: 0.2rem;
        }
        .feature-tag button {
          background: none; border: none; color: rgba(200,245,66,0.5);
          cursor: pointer; font-size: 0.8rem; line-height: 1; padding: 0;
          transition: color 0.2s;
        }
        .feature-tag button:hover { color: #ff6b6b; }

        /* ── Feature inline list in table ── */
        .feature-pill {
          display: inline-block;
          background: rgba(255,255,255,0.04); color: #888;
          padding: 0.15rem 0.5rem; font-size: 0.7rem;
          border-radius: 2px; margin: 0.1rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Skeleton ── */
        .skeleton-line {
          background: rgba(255,255,255,0.06); border-radius: 2px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }

        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;
          background: #C8F542; color: #000; padding: 1rem 1.5rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          font-weight: 500; letter-spacing: 1px;
        }

        /* ── Modal overlay ── */
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          z-index: 100; display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }
        .form-card {
          background: #111; border: 1px solid rgba(255,255,255,0.08);
          width: 100%; max-width: 680px; max-height: 92vh;
          overflow-y: auto; padding: 2.5rem;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-grid .full { grid-column: 1 / -1; }

        /* ── Confirm delete ── */
        .confirm-box {
          background: #1a0a0a; border: 1px solid rgba(255,107,107,0.2);
          padding: 1rem; margin-top: 0.5rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Stat cards ── */
        .stat-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; margin-bottom: 2rem; background: rgba(255,255,255,0.05); }
        .stat-card { background: #111; padding: 1.5rem; }
        .stat-card-val { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: #C8F542; line-height: 1; }
        .stat-card-label { font-family: 'DM Sans', sans-serif; font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: #555; margin-top: 0.25rem; }

        /* ── Checkbox toggle ── */
        .toggle-row { display: flex; align-items: center; gap: 0.75rem; }
        .toggle-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: #C8F542; cursor: pointer; }

        @media (max-width: 900px) {
          .plan-row { grid-template-columns: 2fr 1fr 1fr 100px; }
          .stat-cards { grid-template-columns: repeat(2,1fr); }
          .form-grid { grid-template-columns: 1fr; }
          .form-grid .full { grid-column: 1; }
        }
      `}</style>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '2px' }}>
            PLANS
          </div>
          <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '4px', fontFamily: 'DM Sans, sans-serif' }}>
            {plans.length} total plans · {plans.filter(p => p.isActive).length} active
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Create Plan</button>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-val">{plans.length}</div>
          <div className="stat-card-label">Total Plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{plans.filter(p => p.isActive).length}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">
            {plans.length ? `₹${Math.min(...plans.map(p => p.price)).toLocaleString('en-IN')}` : '—'}
          </div>
          <div className="stat-card-label">Lowest Price</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">
            {plans.length ? `₹${Math.max(...plans.map(p => p.price)).toLocaleString('en-IN')}` : '—'}
          </div>
          <div className="stat-card-label">Highest Price</div>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          className="plans-input"
          placeholder="Search plans by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
          color: '#ff6b6b', padding: '0.75rem 1rem', marginBottom: '1rem',
          fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
        }}>
          {error}
          <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => dispatch(clearError())}>✕</span>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>

        {/* Table Header */}
        <div className="plan-row" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Plan Name', 'Duration', 'Price', 'Features', 'Status', 'Actions'].map((h) => (
            <div key={h} style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444', fontFamily: 'DM Sans, sans-serif' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          [...Array(4)].map((_, i) => (
            <div key={i} className="plan-row">
              <div className="skeleton-line" style={{ height: 14, width: '60%' }} />
              <div className="skeleton-line" style={{ height: 14, width: '50%' }} />
              <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
              <div className="skeleton-line" style={{ height: 14, width: '80%' }} />
              <div className="skeleton-line" style={{ height: 22, width: 60 }} />
              <div className="skeleton-line" style={{ height: 30, width: 120 }} />
            </div>
          ))
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontFamily: 'DM Sans, sans-serif' }}>
            {search ? 'No plans match your search.' : 'No plans yet. Create your first plan.'}
          </div>
        )}

        {/* Plan Rows */}
        {!isLoading && filtered.map((plan) => (
          <div key={plan._id}>
            <div className="plan-row">

              {/* Name + description */}
              <div>
                <div style={{ color: '#fff', fontWeight: 500 }}>{plan.name}</div>
                {plan.description && (
                  <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px', lineHeight: 1.4 }}>
                    {plan.description.length > 60 ? plan.description.slice(0, 60) + '…' : plan.description}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div style={{ color: '#888' }}>{durationLabel(plan.durationMonths)}</div>

              {/* Price */}
              <div style={{ color: '#C8F542', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '1px' }}>
                ₹{plan.price.toLocaleString('en-IN')}
              </div>

              {/* Features */}
              <div>
                {plan.features.slice(0, 3).map((f) => (
                  <span key={f} className="feature-pill">{f}</span>
                ))}
                {plan.features.length > 3 && (
                  <span className="feature-pill">+{plan.features.length - 3} more</span>
                )}
                {plan.features.length === 0 && (
                  <span style={{ color: '#444', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>—</span>
                )}
              </div>

              {/* Status badge */}
              <div>
                <span className="status-badge" style={{
                  background: plan.isActive ? 'rgba(200,245,66,0.1)' : 'rgba(255,107,107,0.1)',
                  color: plan.isActive ? '#C8F542' : '#ff6b6b',
                }}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div>
                {deleteConfirm === plan._id ? (
                  <div className="confirm-box">
                    <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '0.75rem' }}>Delete this plan?</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-danger" onClick={() => handleDelete(plan._id)} disabled={isDeleting}>
                        {isDeleting ? '...' : 'Yes'}
                      </button>
                      <button className="btn-ghost" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }} onClick={() => setDeleteConfirm(null)}>
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => openEdit(plan)}>Edit</button>
                    <button className="btn-danger" onClick={() => setDeleteConfirm(plan._id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {modalMode && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="form-card">

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px' }}>
                  {modalMode === 'create' ? 'CREATE PLAN' : 'EDIT PLAN'}
                </div>
                <div style={{ color: '#555', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>
                  {modalMode === 'create' ? 'Add a new membership plan' : 'Update plan details'}
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                {/* Plan Name */}
                <div className="full">
                  <label className="form-label">Plan Name *</label>
                  <input
                    name="name"
                    className="plans-input"
                    placeholder="e.g. Beast Mode, Elite Pro"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="form-label">Duration (Months) *</label>
                  <input
                    name="durationMonths"
                    type="number"
                    min={1}
                    max={24}
                    className="plans-input"
                    placeholder="e.g. 1, 6, 12"
                    value={form.durationMonths}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    className="plans-input"
                    placeholder="e.g. 4999"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="plans-input"
                    placeholder="Short description of this plan..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Features */}
                <div className="full">
                  <label className="form-label">Features</label>

                  {/* Feature input row */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      className="plans-input"
                      placeholder="Type a feature and press Enter or Add"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={handleFeatureKeyDown}
                    />
                    <button type="button" className="btn-icon" onClick={addFeature}>+ Add</button>
                  </div>

                  {/* Feature tags */}
                  {form.features.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', padding: '0.75rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', minHeight: '52px' }}>
                      {form.features.map((f, i) => (
                        <span key={i} className="feature-tag">
                          {f}
                          <button type="button" onClick={() => removeFeature(i)}>✕</button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '0.75rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', color: '#444', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem' }}>
                      No features added yet. Type above and press Enter.
                    </div>
                  )}
                </div>

                {/* isActive toggle */}
                <div className="full">
                  <label className="form-label" style={{ marginBottom: '0.6rem' }}>Visibility</label>
                  <div className="toggle-row">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                    <label htmlFor="isActive" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: form.isActive ? '#C8F542' : '#666', cursor: 'pointer' }}>
                      {form.isActive ? 'Active — visible to members' : 'Inactive — hidden from members'}
                    </label>
                  </div>
                </div>

              </div>

              {/* Preview strip */}
              {form.name && (
                <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#0a0a0a', border: '1px solid rgba(200,245,66,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', letterSpacing: '2px', color: '#fff' }}>
                      {form.name.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>
                      {durationLabel(form.durationMonths)} · {form.features.length} features
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.75rem', color: '#C8F542', letterSpacing: '1px' }}>
                    ₹{Number(form.price).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" disabled={isBusy}>
                  {isBusy
                    ? modalMode === 'create' ? 'Creating...' : 'Saving...'
                    : modalMode === 'create' ? 'Create Plan' : 'Save Changes'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Success Toast ─────────────────────────────────────────────────── */}
      {successMessage && <div className="toast">✓ {successMessage}</div>}
    </div>
  );
}