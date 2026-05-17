'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  clearError,
  clearSuccessMessage,
} from '@/store/Slices/trainerSlice';
import type { Trainer } from '@/store/Slices/trainerSlice';

// ─── Specializations ──────────────────────────────────────────────────────────
const SPECIALIZATIONS = [
  'Strength Training',
  'Cardio',
  'Yoga',
  'CrossFit',
  'Bodybuilding',
  'Nutrition',
  'Rehabilitation',
  'HIIT',
  'Zumba',
  'Pilates'
];

const AVAILABLE_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// ─── Form Type ────────────────────────────────────────────────────────────────
type TrainerForm = {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  certification: string;
  experience: number;
  bio: string;
  achievements: string[];
  availableDays: string[];
  availableTime: {
    start: string;
    end: string;
  };
};

const emptyForm: TrainerForm = {
  fullName: '',
  email: '',
  phone: '',
  specialization: 'Strength Training',
  certification: '',
  experience: 0,
  bio: '',
  achievements: [],
  availableDays: [],
  availableTime: { start: '09:00', end: '18:00' }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Trainers() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    trainers,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.trainers);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [achievementInput, setAchievementInput] = useState('');
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchTrainers());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      closeForm();
    }
  }, [successMessage, dispatch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingTrainer(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setForm({
      fullName: trainer.fullName || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || 'Strength Training',
      certification: trainer.certification || '',
      experience: trainer.experience || 0,
      bio: trainer.bio || '',
      achievements: trainer.achievements || [],
      availableDays: trainer.availableDays || [],
      availableTime: trainer.availableTime || { start: '09:00', end: '18:00' },
    });
    // Set image preview if exists
    if (trainer.photo) {
      setImagePreview(`http://localhost:5000${trainer.photo}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowForm(true);
  };

const closeForm = () => {
  setShowForm(false);
  setEditingTrainer(null);
  setForm(emptyForm);
  setAchievementInput('');
  setImageFile(null);
  setImagePreview(null);
  setSubmitError(null); // ← add this
  if (fileInputRef.current) fileInputRef.current.value = '';
};
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'availableDays') {
        const day = value;
        const updatedDays = form.availableDays.includes(day)
          ? form.availableDays.filter(d => d !== day)
          : [...form.availableDays, day];
        setForm({ ...form, availableDays: updatedDays });
      }
    } else if (name === 'start' || name === 'end') {
      setForm({
        ...form,
        availableTime: { ...form.availableTime, [name]: value }
      });
    } else {
      setForm({
        ...form,
        [name]: name === 'experience' ? Number(value) : value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setForm({
        ...form,
        achievements: [...form.achievements, achievementInput.trim()]
      });
      setAchievementInput('');
    }
  };

  const removeAchievement = (index: number) => {
    setForm({
      ...form,
      achievements: form.achievements.filter((_, i) => i !== index)
    });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError(null); // clear previous error

  const formData = new FormData();
  formData.append('fullName', form.fullName);
  formData.append('email', form.email);
  formData.append('phone', form.phone);
  formData.append('specialization', form.specialization);
  formData.append('certification', form.certification);
  formData.append('experience', form.experience.toString());
  formData.append('bio', form.bio);
  formData.append('achievements', JSON.stringify(form.achievements));
  formData.append('availableDays', JSON.stringify(form.availableDays));
  formData.append('availableTime', JSON.stringify(form.availableTime));

  if (form.bio.length > 500) {
    setSubmitError(`Bio is too long — ${form.bio.length}/500 characters used. Please shorten it.`);
    return; // stop here, never hits the API
  }
  
  if (imageFile) {
    formData.append('photo', imageFile);
  }

  let result;
  if (editingTrainer) {
    result = await dispatch(updateTrainer({ id: editingTrainer._id, trainerData: formData }));
  } else {
    result = await dispatch(createTrainer(formData));
  }

  // Show error if thunk was rejected
  if (result.meta.requestStatus === 'rejected') {
    setSubmitError((result as any).payload || 'Something went wrong. Please try again.');
  }
};

  const handleDelete = (id: string) => {
    dispatch(deleteTrainer(id));
    setDeleteConfirm(null);
  };

  // ── Filter trainers ────────────────────────────────────────────────────────
  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.includes(search);
    const matchesSpecialization = selectedSpecialization === 'all' || t.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const isBusy = isCreating || isUpdating;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        
        .trainers-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.75rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          border-radius: 2px;
        }
        
        .trainers-input:focus {
          border-color: #C8F542;
        }
        
        .trainers-input::placeholder {
          color: #444;
        }
        
        .trainers-input option {
          background: #111;
        }
        
        .form-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
          display: block;
          margin-bottom: 0.4rem;
        }
        
        .btn-primary {
          background: #C8F542;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .btn-primary:hover:not(:disabled) {
          opacity: 0.85;
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-ghost {
          background: transparent;
          color: #666;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-ghost:hover {
          border-color: #fff;
          color: #fff;
        }
        
        .btn-edit {
          background: transparent;
          color: #C8F542;
          border: 1px solid rgba(200,245,66,0.3);
          padding: 0.4rem 0.85rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          margin-right: 0.5rem;
        }
        
        .btn-edit:hover {
          background: rgba(200,245,66,0.08);
        }
        
        .btn-danger {
          background: transparent;
          color: #ff6b6b;
          border: 1px solid rgba(255,107,107,0.3);
          padding: 0.4rem 0.85rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-danger:hover {
          background: rgba(255,107,107,0.1);
        }
        
        .trainer-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1.5fr;
          gap: 1rem;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        
        .trainer-row:hover {
          background: rgba(255,255,255,0.02);
        }
        
        .specialization-badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          font-size: 0.7rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 500;
          border-radius: 2px;
          background: rgba(200,245,66,0.1);
          color: #C8F542;
        }
        
        .skeleton-line {
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          background: #C8F542;
          color: #000;
          padding: 1rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 1px;
        }
        
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .form-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2.5rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        
        .form-grid .full {
          grid-column: 1/-1;
        }
        
        .confirm-box {
          background: #1a0a0a;
          border: 1px solid rgba(255,107,107,0.2);
          padding: 1rem;
          font-family: 'DM Sans', sans-serif;
        }
        
        .day-checkbox {
          display: inline-flex;
          align-items: center;
          margin-right: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .day-checkbox label {
          margin-left: 0.3rem;
          font-size: 0.8rem;
          color: #888;
        }
        
        .achievement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0a0a0a;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 2px;
        }
        
        .remove-achievement {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .image-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-top: 0.5rem;
          border: 2px solid #C8F542;
        }
        
        .image-upload-label {
          cursor: pointer;
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #0a0a0a;
          border: 1px dashed rgba(255,255,255,0.3);
          border-radius: 4px;
          color: #888;
          font-size: 0.8rem;
        }
        
        .image-upload-label:hover {
          border-color: #C8F542;
          color: #C8F542;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.5rem', letterSpacing: '2px' }}>
            TRAINERS
          </div>
          <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '4px', fontFamily: 'DM Sans,sans-serif' }}>
            {trainers.length} total trainers
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Trainer</button>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="trainers-input"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <select
          className="trainers-input"
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="all">All Specializations</option>
          {SPECIALIZATIONS.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'DM Sans,sans-serif', fontSize: '0.85rem' }}>
          {error}
          <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => dispatch(clearError())}>✕</span>
        </div>
      )}

      {/* Table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#111' }}>
        {/* Header row */}
        <div className="trainer-row" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444' }}>Name</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444' }}>Contact</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444' }}>Specialization</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444' }}>Certification</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444' }}>Actions</div>
        </div>

        {/* Skeleton loading */}
        {isLoading && [...Array(4)].map((_, i) => (
          <div key={i} className="trainer-row">
            <div className="skeleton-line" style={{ height: 13, width: '60%' }} />
            <div className="skeleton-line" style={{ height: 13, width: '50%' }} />
            <div className="skeleton-line" style={{ height: 13, width: '40%' }} />
            <div className="skeleton-line" style={{ height: 13, width: '55%' }} />
            <div className="skeleton-line" style={{ height: 30, width: 100 }} />
          </div>
        ))}

        {/* Empty state */}
        {!isLoading && filteredTrainers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontFamily: 'DM Sans,sans-serif' }}>
            {search ? 'No trainers match your search.' : 'No trainers yet. Add your first trainer.'}
          </div>
        )}

        {/* Trainer rows */}
        {!isLoading && filteredTrainers.map((trainer) => (
          <div key={trainer._id} className="trainer-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {trainer.photo && (
                <img 
                  src={`http://localhost:5000${trainer.photo}`} 
                  alt={trainer.fullName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div>
                <div style={{ color: '#fff', fontWeight: 500 }}>{trainer.fullName}</div>
                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                  {trainer.experience}+ years exp
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.8rem' }}>{trainer.email}</div>
              <div style={{ color: '#666', fontSize: '0.7rem', marginTop: '2px' }}>{trainer.phone}</div>
            </div>
            <div>
              <span className="specialization-badge">{trainer.specialization}</span>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.8rem' }}>{trainer.certification?.substring(0, 30)}...</div>
              <div style={{ fontSize: '0.7rem', color: '#C8F542', marginTop: '2px' }}>★ {trainer.rating || 0}</div>
            </div>
            <div>
              {deleteConfirm === trainer._id ? (
                <div className="confirm-box">
                  <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '0.5rem' }}>Delete this trainer?</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-danger" onClick={() => handleDelete(trainer._id)} disabled={isDeleting}>
                      {isDeleting ? '...' : 'Yes'}
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }} onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex' }}>
                  <button className="btn-edit" onClick={() => openEdit(trainer)}>Edit</button>
                  <button className="btn-danger" onClick={() => setDeleteConfirm(trainer._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', letterSpacing: '2px' }}>
                  {editingTrainer ? 'EDIT TRAINER' : 'ADD TRAINER'}
                </div>
                <div style={{ color: '#555', fontSize: '0.8rem', fontFamily: 'DM Sans,sans-serif' }}>
                  {editingTrainer ? 'Update trainer details' : 'Fill in trainer information'}
                </div>
              </div>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="full">
                  <label className="form-label">Profile Photo</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="image-upload-label">
                    📸 Choose Image (Max 5MB)
                  </label>
                  {imagePreview && (
                    <div>
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    </div>
                  )}
                </div>

                <div className="full">
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" className="trainers-input" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
                </div>
                
                <div>
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="trainers-input" placeholder="trainer@email.com" value={form.email} onChange={handleChange} required />
                </div>
                
                <div>
                  <label className="form-label">Phone *</label>
                  <input name="phone" className="trainers-input" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
                </div>
                
                <div>
                  <label className="form-label">Specialization *</label>
                  <select name="specialization" className="trainers-input" value={form.specialization} onChange={handleChange} required>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Experience (years) *</label>
                  <input name="experience" type="number" min={0} max={50} className="trainers-input" value={form.experience} onChange={handleChange} required />
                </div>
                
                <div className="full">
                  <label className="form-label">Certification *</label>
                  <input name="certification" className="trainers-input" placeholder="e.g., Certified Personal Trainer (CPT)" value={form.certification} onChange={handleChange} required />
                </div>
                
                <div className="full">
                  <label className="form-label">Bio</label>
                  <textarea name="bio" rows={3} className="trainers-input" placeholder="Trainer's background and expertise..." value={form.bio} onChange={handleChange} />
                </div>
                
                <div className="full">
                  <label className="form-label">Achievements</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      className="trainers-input"
                      placeholder="Add achievement..."
                      value={achievementInput}
                      onChange={(e) => setAchievementInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                    />
                    <button type="button" className="btn-ghost" onClick={addAchievement} style={{ padding: '0.5rem 1rem' }}>+</button>
                  </div>
                  {form.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-item">
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>🏆 {achievement}</span>
                      <button type="button" className="remove-achievement" onClick={() => removeAchievement(index)}>✕</button>
                    </div>
                  ))}
                </div>
                
                <div className="full">
                  <label className="form-label">Available Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {AVAILABLE_DAYS.map(day => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          name="availableDays"
                          value={day}
                          checked={form.availableDays.includes(day)}
                          onChange={handleChange}
                        />
                        <span>{day.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Available From</label>
                  <input name="start" type="time" className="trainers-input" value={form.availableTime.start} onChange={handleChange} />
                </div>
                
                <div>
                  <label className="form-label">Available To</label>
                  <input name="end" type="time" className="trainers-input" value={form.availableTime.end} onChange={handleChange} />
                </div>
              </div>

{/* Error Banner — add this just before the submit button row */}
{(submitError || error) && (
  <div style={{
    background: 'rgba(255,107,107,0.08)',
    border: '1px solid rgba(255,107,107,0.3)',
    color: '#ff6b6b',
    padding: '0.85rem 1rem',
    marginTop: '1.5rem',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '2px',
  }}>
    <span>⚠ {submitError || error}</span>
    <button
      type="button"
      onClick={() => { setSubmitError(null); dispatch(clearError()); }}
      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1rem' }}
    >
      ✕
    </button>
  </div>
)}

<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
  <button type="submit" className="btn-primary" disabled={isBusy}>
    {isBusy ? 'Saving...' : editingTrainer ? 'Update Trainer' : 'Create Trainer'}
  </button>
  <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
</div>  
              {/* <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn-primary" disabled={isBusy}>
                  {isBusy ? 'Saving...' : editingTrainer ? 'Update Trainer' : 'Create Trainer'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
              </div> */}
            </form>
          </div>
        </div>
      )}

      {successMessage && <div className="toast">✓ {successMessage}</div>}
    </div>
  );
}