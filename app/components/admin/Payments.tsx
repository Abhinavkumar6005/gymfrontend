'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchMemberPayments,
  clearError,
} from '@/store/Slices/paymentsSlice';
import { fetchMembers } from '@/store/Slices/membersSlice';
import { Member } from '@/store/Slices/membersSlice';
import PaymentModal from '../PaymentModel';

export default function Payments() {
  const dispatch = useDispatch<AppDispatch>();

  const { members, isLoading: isMembersLoading } = useSelector(
    (state: RootState) => state.members
  );
  const { payments, isLoading: isPaymentsLoading, error } = useSelector(
    (state: RootState) => state.payments
  );

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [methodFilter, setMethodFilter]   = useState('all');
  const [payingMember, setPayingMember]   = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // ✅ Fetch all members on mount — payments load when a member is selected
  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch , payingMember]);

  // ✅ When a member is selected, fetch their payments
  useEffect(() => {
    if (selectedMemberId) {
      dispatch(fetchMemberPayments(selectedMemberId));
    }
  }, [selectedMemberId, dispatch , payingMember]);

  const isLoading = isMembersLoading;

  // ✅ Filter members by search
  const filteredMembers = !isMembersLoading
    ? members.filter(m =>
        m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search)
      )
    : [];

  // ✅ Filter payments by status/method
  // Note: If payment doesn't have a status, treat it as 'completed' (default)
  const filteredPayments = !isPaymentsLoading
    ? payments.filter(p => {
        const paymentStatus = p.status || 'completed'; // Default status if missing
        const matchStatus = statusFilter === 'all' || paymentStatus === statusFilter;
        const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
        return matchStatus && matchMethod;
      })
    : [];

  const selectedMember = members.find(m => m._id === selectedMemberId) || null;

  const totalRevenue = payments
    .filter(p => (p.status || 'completed') === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const methodColor = (method: string) => {
    if (method === 'cash')       return '#C8F542';
    if (method === 'online')     return '#4fc3f7';
    if (method === 'upi')        return '#ba68c8';
    if (method === 'card')       return '#ffb74d';
    if (method === 'netbanking') return '#81c784';
    return '#666';
  };

  const statusColor = (status: string) => {
    if (status === 'completed') return '#C8F542';
    if (status === 'deleted')   return '#ff6b6b';
    if (status === 'pending')   return '#f0a500';
    if (status === 'failed')    return '#ff6b6b';
    return '#C8F542'; // Default to completed color
  };

  // Helper function to get display date from payment
  const getPaymentDate = (payment: any) => {
    // Use paymentDate if available, fallback to createdAt, then current date
    const dateString = payment.paymentDate || payment.createdAt;
    return dateString ? new Date(dateString) : new Date();
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .pay-input { width:100%; background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s; border-radius:2px; }
        .pay-input:focus { border-color:#C8F542; }
        .pay-input::placeholder { color:#444; }
        .pay-input option { background:#111; }

        .member-card { padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 0.15s; font-family:'DM Sans',sans-serif; }
        .member-card:hover { background:rgba(255,255,255,0.03); }
        .member-card.active { background:rgba(200,245,66,0.06); border-left:2px solid #C8F542; }

        .payment-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr; gap:1rem; align-items:center; padding:0.9rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'DM Sans',sans-serif; font-size:0.85rem; transition:background 0.2s; }
        .payment-row:hover { background:rgba(255,255,255,0.02); }

        .badge { display:inline-block; padding:0.2rem 0.6rem; font-size:0.65rem; letter-spacing:1px; text-transform:uppercase; font-weight:500; border-radius:2px; }

        .skeleton-line { background:rgba(255,255,255,0.06); border-radius:2px; animation:skPulse 1.5s ease-in-out infinite; }
        @keyframes skPulse { 0%,100%{opacity:0.35} 50%{opacity:0.8} }

        .stat-card { background:#111; border:1px solid rgba(255,255,255,0.06); padding:1.25rem 1.5rem; }

        .filter-select { background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); color:#666; padding:0.5rem 0.75rem; font-family:'DM Sans',sans-serif; font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; outline:none; cursor:pointer; border-radius:2px; transition:border-color 0.2s; }
        .filter-select:focus { border-color:#C8F542; color:#fff; }
        .filter-select option { background:#111; text-transform:none; }

        .pay-now-btn { background:#C8F542; color:#000; border:none; padding:0.5rem 1rem; font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.75rem; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s; border-radius:2px; white-space:nowrap; }
        .pay-now-btn:hover { opacity:0.85; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem' }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.5rem', letterSpacing:'2px' }}>PAYMENTS</div>
          <div style={{ color:'#555', fontSize:'0.85rem', marginTop:'4px', fontFamily:'DM Sans,sans-serif' }}>
            {isMembersLoading ? 'Loading...' : `${members.length} members · select one to view payments`}
          </div>
        </div>
        {/* Stats */}
        {selectedMemberId && (
          <div style={{ display:'flex', gap:'1rem' }}>
            <div className="stat-card" style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#C8F542', letterSpacing:'1px' }}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize:'0.65rem', color:'#555', letterSpacing:'2px', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif' }}>
                Total Collected
              </div>
            </div>
            <div className="stat-card" style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#fff', letterSpacing:'1px' }}>
                {payments.filter(p => (p.status || 'completed') === 'completed').length}
              </div>
              <div style={{ fontSize:'0.65rem', color:'#555', letterSpacing:'2px', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif' }}>
                Transactions
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', color:'#ff6b6b', padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'DM Sans,sans-serif', fontSize:'0.85rem' }}>
          {error}
          <span style={{ float:'right', cursor:'pointer' }} onClick={() => dispatch(clearError())}>✕</span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', alignItems:'start' }}>

        {/* ── Left: Member List ── */}
        <div style={{ border:'1px solid rgba(255,255,255,0.06)', background:'#111', position:'sticky', top:'1rem' }}>
          <div style={{ padding:'1rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <input
              className="pay-input"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Skeleton while members load */}
          {isMembersLoading && [...Array(5)].map((_, i) => (
            <div key={i} style={{ padding:'0.85rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.04)', opacity: 1 - i * 0.15 }}>
              <div className="skeleton-line" style={{ height:13, width:'65%', marginBottom:6 }} />
              <div className="skeleton-line" style={{ height:10, width:'45%' }} />
            </div>
          ))}

          {/* ✅ Member list — only when NOT loading */}
          {!isMembersLoading && filteredMembers.length === 0 && (
            <div style={{ padding:'2rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif', fontSize:'0.85rem' }}>
              No members found.
            </div>
          )}

          {!isMembersLoading && filteredMembers.map(member => (
            <div
              key={member._id}
              className={`member-card${selectedMemberId === member._id ? ' active' : ''}`}
              onClick={() => setSelectedMemberId(member._id)}
            >
              <div style={{ color: selectedMemberId === member._id ? '#C8F542' : '#fff', fontWeight:500, fontSize:'0.875rem' }}>
                {member.fullName}
              </div>
              <div style={{ fontSize:'0.75rem', color:'#555', marginTop:'2px' }}>
                {member.phone}
              </div>
              {member.remainingAmount > 0 && (
                <div style={{ fontSize:'0.7rem', color:'#ff6b6b', marginTop:'2px' }}>
                  Due: ₹{member.remainingAmount.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Right: Payment History ── */}
        <div>
          {!selectedMemberId ? (
            <div style={{ border:'1px solid rgba(255,255,255,0.06)', background:'#111', padding:'4rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>💳</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#333', letterSpacing:'2px' }}>
                SELECT A MEMBER
              </div>
              <div style={{ color:'#444', fontSize:'0.85rem', marginTop:'0.5rem', fontFamily:'DM Sans,sans-serif' }}>
                Click any member on the left to view their payment history
              </div>
            </div>
          ) : (
            <>
              {/* Selected member header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', padding:'1rem 1.25rem', background:'#111', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:500, color:'#fff' }}>
                    {selectedMember?.fullName}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'#555', marginTop:'2px', fontFamily:'DM Sans,sans-serif' }}>
                    {selectedMember?.email} · Ends {selectedMember?.membershipEnd
                      ? new Date(selectedMember.membershipEnd).toLocaleDateString('en-IN')
                      : '—'}
                  </div>
                </div>
                <button
                  className="pay-now-btn"
                  onClick={() => selectedMember && setPayingMember(selectedMember)}
                >
                  + New Payment
                </button>
              </div>

              {/* Filters */}
              <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1rem' }}>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="deleted">Deleted</option>
                </select>
                <select className="filter-select" value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              {/* Payment table */}
              <div style={{ border:'1px solid rgba(255,255,255,0.06)', background:'#111' }}>
                {/* Table header */}
                <div className="payment-row" style={{ background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  {['Date', 'Amount', 'Method', 'Months', 'Status'].map(h => (
                    <div key={h} style={{ fontSize:'0.65rem', letterSpacing:'2px', textTransform:'uppercase', color:'#444', fontFamily:'DM Sans,sans-serif' }}>{h}</div>
                  ))}
                </div>

                {/* ✅ Skeleton while payments load */}
                {isPaymentsLoading && [...Array(4)].map((_, i) => (
                  <div key={i} className="payment-row" style={{ opacity: 1 - i * 0.2 }}>
                    <div className="skeleton-line" style={{ height:13, width:'60%' }} />
                    <div className="skeleton-line" style={{ height:13, width:'50%' }} />
                    <div className="skeleton-line" style={{ height:22, width:50, borderRadius:2 }} />
                    <div className="skeleton-line" style={{ height:13, width:30 }} />
                    <div className="skeleton-line" style={{ height:22, width:70, borderRadius:2 }} />
                  </div>
                ))}

                {/* ✅ Empty state — only after load */}
                {!isPaymentsLoading && filteredPayments.length === 0 && (
                  <div style={{ padding:'3rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif', fontSize:'0.85rem' }}>
                    No payments found.
                  </div>
                )}

                {/* ✅ Payment rows — only after load */}
                {!isPaymentsLoading && filteredPayments.map(payment => {
                  const paymentDate = getPaymentDate(payment);
                  const paymentStatus = payment.status || 'completed';
                  const isDeleted = paymentStatus === 'deleted';
                  
                  return (
                    <div key={payment._id} className="payment-row" style={{ opacity: isDeleted ? 0.5 : 1 }}>
                      <div>
                        <div style={{ color:'#fff', fontSize:'0.85rem' }}>
                          {paymentDate.toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ fontSize:'0.7rem', color:'#555', marginTop:'2px' }}>
                          {paymentDate.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                        </div>
                        {payment.receiptNumber && (
                          <div style={{ fontSize:'0.65rem', color:'#444', marginTop:'2px', letterSpacing:'1px' }}>
                            {payment.receiptNumber}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontFamily:"'Bebas Neue',sans-serif",
                        fontSize:'1.2rem',
                        letterSpacing:'1px',
                        color: isDeleted ? '#ff6b6b' : '#C8F542',
                        textDecoration: isDeleted ? 'line-through' : 'none',
                      }}>
                        ₹{payment.amount?.toLocaleString('en-IN')}
                      </div>
                      <div>
                        <span className="badge" style={{ background:`${methodColor(payment.paymentMethod)}18`, color:methodColor(payment.paymentMethod) }}>
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <div style={{ color:'#888', fontSize:'0.85rem' }}>
                        {payment.paymentForMonths} mo{payment.paymentForMonths !== 1 ? 's' : ''}
                      </div>
                      <div>
                        <span className="badge" style={{ background:`${statusColor(paymentStatus)}18`, color:statusColor(paymentStatus) }}>
                          {paymentStatus}
                        </span>
                        {payment.deletedReason && (
                          <div style={{ fontSize:'0.65rem', color:'#ff6b6b', marginTop:'4px' }}>
                            {payment.deletedReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                {!isPaymentsLoading && filteredPayments.length > 0 && (
                  <div style={{ padding:'0.85rem 1.25rem', background:'#0a0a0a', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.65rem', color:'#555', letterSpacing:'2px', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif' }}>
                      Total Collected ({filteredPayments.filter(p => (p.status || 'completed') === 'completed').length} payments)
                    </span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.25rem', color:'#C8F542', letterSpacing:'1px' }}>
                      ₹{filteredPayments.filter(p => (p.status || 'completed') === 'completed').reduce((s, p) => s + (p.amount || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payingMember && (
        <PaymentModal
          member={payingMember}
          onClose={() => {
            setPayingMember(null);
            // Refresh payments after modal closes
            if (selectedMemberId) {
              dispatch(fetchMemberPayments(selectedMemberId));
            }
          }}
        />
      )}
    </div>
  );
}