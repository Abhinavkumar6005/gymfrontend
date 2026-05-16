'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMembers, createMember, updateMember, deleteMember, clearError, clearSuccessMessage } from '@/store/Slices/membersSlice';
import { Member } from '@/store/Slices/membersSlice';
import { fetchPlans } from '@/store/Slices/PlansSlice';
import PaymentModal from '../PaymentModel';

const emptyForm = {
  fullName: '', email: '', phone: '', address: '',
  gender: 'male', membershipPlan: '', membershipStart: '',
  membershipEnd: '', amountPaid: 0, remainingAmount: 0,
  status: 'active', paymentStatus: 'paid', isActive: true,
};

export default function Members() {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading, isCreating, isUpdating, isDeleting, error, successMessage } = useSelector(
    (state: RootState) => state.members
  );
  const { plans } = useSelector((state: RootState) => state.plans);

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [payingMember, setPayingMember] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      closeForm();
    }
  }, [successMessage, dispatch]);

  const openCreate = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender || 'male',
      membershipPlan: typeof member.membershipPlan === 'object' ? member.membershipPlan._id : member.membershipPlan || '',
      membershipStart: member.membershipStart?.slice(0, 10) || '',
      membershipEnd: member.membershipEnd?.slice(0, 10) || '',
      amountPaid: member.amountPaid || 0,
      remainingAmount: member.remainingAmount || 0,
      status: member.status || 'active',
      paymentStatus: member.paymentStatus || 'paid',
      isActive: member.isActive ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setForm(emptyForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      dispatch(updateMember({ id: editingMember._id, memberData: form as any }));
    } else {
      dispatch(createMember(form as any));
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteMember(id));
    setDeleteConfirm(null);
  };

  const filtered = members.filter(m =>
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const statusColor = (status: string) => {
    if (status === 'active') return '#C8F542';
    if (status === 'expired') return '#ff6b6b';
    if (status === 'pending') return '#f0a500';
    return '#666';
  };

  const isBusy = isCreating || isUpdating;

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .members-input { width:100%; background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s; border-radius:2px; }
        .members-input:focus { border-color:#C8F542; }
        .members-input::placeholder { color:#444; }
        .members-input option { background:#111; }
        .form-label { font-family:'DM Sans',sans-serif; font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:#555; display:block; margin-bottom:0.4rem; }
        .btn-primary { background:#C8F542; color:#000; border:none; padding:0.75rem 1.5rem; font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.8rem; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s; }
        .btn-primary:hover:not(:disabled) { opacity:0.85; }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-ghost { background:transparent; color:#666; border:1px solid rgba(255,255,255,0.1); padding:0.75rem 1.5rem; font-family:'DM Sans',sans-serif; font-size:0.8rem; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
        .btn-ghost:hover { border-color:#fff; color:#fff; }
        .btn-edit { background:transparent; color:#C8F542; border:1px solid rgba(200,245,66,0.3); padding:0.4rem 0.85rem; font-family:'DM Sans',sans-serif; font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; margin-right:0.5rem; }
        .btn-edit:hover { background:rgba(200,245,66,0.08); }
        .btn-pay { background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.2); padding:0.4rem 0.85rem; font-family:'DM Sans',sans-serif; font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; margin-right:0.5rem; }
        .btn-pay:hover { background:rgba(255,255,255,0.06); border-color:#fff; }
        .btn-danger { background:transparent; color:#ff6b6b; border:1px solid rgba(255,107,107,0.3); padding:0.4rem 0.85rem; font-family:'DM Sans',sans-serif; font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
        .btn-danger:hover { background:rgba(255,107,107,0.1); }
        .member-row { display:grid; grid-template-columns:2fr 2fr 1.5fr 1fr 1fr 2fr; gap:1rem; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'DM Sans',sans-serif; font-size:0.85rem; transition:background 0.2s; }
        .member-row:hover { background:rgba(255,255,255,0.02); }
        .status-badge { display:inline-block; padding:0.25rem 0.6rem; font-size:0.7rem; letter-spacing:1px; text-transform:uppercase; font-weight:500; border-radius:2px; }
        .toast { position:fixed; bottom:2rem; right:2rem; z-index:1000; background:#C8F542; color:#000; padding:1rem 1.5rem; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500; letter-spacing:1px; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:100; display:flex; align-items:center; justify-content:center; padding:2rem; }
        .form-card { background:#111; border:1px solid rgba(255,255,255,0.08); width:100%; max-width:700px; max-height:90vh; overflow-y:auto; padding:2.5rem; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .form-grid .full { grid-column:1/-1; }
        .confirm-box { background:#1a0a0a; border:1px solid rgba(255,107,107,0.2); padding:1rem; margin-top:0.5rem; font-family:'DM Sans',sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem' }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.5rem', letterSpacing:'2px' }}>MEMBERS</div>
          <div style={{ color:'#555', fontSize:'0.85rem', marginTop:'4px', fontFamily:'DM Sans,sans-serif' }}>{members.length} total members</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Member</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom:'1.5rem' }}>
        <input className="members-input" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth:'400px' }} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', color:'#ff6b6b', padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'DM Sans,sans-serif', fontSize:'0.85rem' }}>
          {error}
          <span style={{ float:'right', cursor:'pointer' }} onClick={() => dispatch(clearError())}>✕</span>
        </div>
      )}

      {/* Table */}
      <div style={{ border:'1px solid rgba(255,255,255,0.06)', background:'#111' }}>
        <div className="member-row" style={{ background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          {['Name', 'Email', 'Phone', 'Status', 'Payment', 'Actions'].map(h => (
            <div key={h} style={{ fontSize:'0.7rem', letterSpacing:'2px', textTransform:'uppercase', color:'#444', fontFamily:'DM Sans,sans-serif' }}>{h}</div>
          ))}
        </div>

        {isLoading && <div style={{ padding:'3rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif' }}>Loading members...</div>}

        {!isLoading && filtered.length === 0 && (
          <div style={{ padding:'3rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif' }}>
            {search ? 'No members match your search.' : 'No members yet. Add your first member.'}
          </div>
        )}

        {filtered.map((member) => (
          <div key={member._id} className="member-row">
            <div>
              <div style={{ color:'#fff', fontWeight:500 }}>{member.fullName}</div>
              <div style={{ fontSize:'0.75rem', color:'#555', marginTop:'2px' }}>
                {typeof member.membershipPlan === 'object' ? member.membershipPlan.name : '—'}
              </div>
            </div>
            <div style={{ color:'#888' }}>{member.email}</div>
            <div style={{ color:'#888' }}>{member.phone}</div>
            <div>
              <span className="status-badge" style={{ background:`${statusColor(member.status)}18`, color:statusColor(member.status) }}>
                {member.status}
              </span>
            </div>
            <div>
              <span className="status-badge" style={{ background: member.paymentStatus === 'paid' ? 'rgba(200,245,66,0.1)' : 'rgba(255,107,107,0.1)', color: member.paymentStatus === 'paid' ? '#C8F542' : '#ff6b6b' }}>
                {member.paymentStatus}
              </span>
            </div>
            <div>
              {deleteConfirm === member._id ? (
                <div className="confirm-box">
                  <div style={{ fontSize:'0.8rem', color:'#ff6b6b', marginBottom:'0.5rem' }}>Delete?</div>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button className="btn-danger" onClick={() => handleDelete(member._id)} disabled={isDeleting}>{isDeleting ? '...' : 'Yes'}</button>
                    <button className="btn-ghost" style={{ padding:'0.4rem 0.85rem', fontSize:'0.75rem' }} onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem' }}>
                  <button className="btn-edit" onClick={() => openEdit(member)}>Edit</button>
                  <button className="btn-pay" onClick={() => setPayingMember(member)}>Pay</button>
                  <button className="btn-danger" onClick={() => setDeleteConfirm(member._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Member Modal */}
      {showForm && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="form-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'2px' }}>
                  {editingMember ? 'EDIT MEMBER' : 'ADD MEMBER'}
                </div>
                <div style={{ color:'#555', fontSize:'0.8rem', fontFamily:'DM Sans,sans-serif' }}>
                  {editingMember ? 'Update member details' : 'Fill in member details'}
                </div>
              </div>
              <button onClick={closeForm} style={{ background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'1.25rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" className="members-input" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="members-input" placeholder="john@email.com" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Phone *</label>
                  <input name="phone" className="members-input" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select name="gender" className="members-input" value={form.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="full">
                  <label className="form-label">Address</label>
                  <input name="address" className="members-input" placeholder="Street, City" value={form.address} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Membership Plan *</label>
                  <select name="membershipPlan" className="members-input" value={form.membershipPlan} onChange={handleChange} required>
                    <option value="">Select plan</option>
                    {plans.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select name="status" className="members-input" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Membership Start *</label>
                  <input name="membershipStart" type="date" className="members-input" value={form.membershipStart} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Membership End *</label>
                  <input name="membershipEnd" type="date" className="members-input" value={form.membershipEnd} onChange={handleChange} required />
                </div>
                <div>
                  <label className="form-label">Amount Paid (₹)</label>
                  <input name="amountPaid" type="number" className="members-input" placeholder="0" value={form.amountPaid} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Remaining Amount (₹)</label>
                  <input name="remainingAmount" type="number" className="members-input" placeholder="0" value={form.remainingAmount} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Payment Status</label>
                  <select name="paymentStatus" className="members-input" value={form.paymentStatus} onChange={handleChange}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div style={{ display:'flex', gap:'1rem', marginTop:'2rem' }}>
                <button type="submit" className="btn-primary" disabled={isBusy}>
                  {isBusy ? 'Saving...' : editingMember ? 'Update Member' : 'Create Member'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingMember && (
        <PaymentModal
          member={payingMember}
          onClose={() => setPayingMember(null)}
        />
      )}

      {successMessage && <div className="toast">{successMessage}</div>}
    </div>
  );
}