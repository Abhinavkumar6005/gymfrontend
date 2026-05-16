'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  processManualPayment,
  fetchMemberPayments,
  clearError,
  clearSuccessMessage,
  clearActiveOrder,
  clearReceiptNumber,
  deletePayment,
} from '@/store/Slices/paymentsSlice';
import { Member } from '@/store/Slices/membersSlice';

declare global {
  interface Window { Razorpay: any; }
}

interface PaymentModalProps {
  member: Member | null;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { value: 'online',     label: 'Online (Razorpay)' },
  { value: 'cash',       label: 'Cash' },
  { value: 'upi',        label: 'UPI (Manual)' },
  { value: 'card',       label: 'Card (Manual)' },
  { value: 'netbanking', label: 'Net Banking (Manual)' },
];

export default function PaymentModal({ member, onClose }: PaymentModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    activeOrder,
    isCreatingOrder,
    isVerifying,
    isProcessingManual,
    isLoading,
    payments,
    error,
    successMessage,
    receiptNumber,
    isDeleting,
  } = useSelector((state: RootState) => state.payments);

  const [tab, setTab] = useState<'pay' | 'history'>('pay');
  const [amount, setAmount] = useState<number>(0);
  const [months, setMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  const isBusy = isCreatingOrder || isVerifying || isProcessingManual || isDeleting;

  if (!member?._id) return null;

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    dispatch(fetchMemberPayments(member._id));
  }, []);

  useEffect(() => {
    if (!activeOrder) return;
    openRazorpayModal(activeOrder);
  }, [activeOrder]);

  useEffect(() => {
    if (!successMessage || !member?._id) return;
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
      dispatch(clearReceiptNumber());
      dispatch(fetchMemberPayments(member._id));
      setTab('history');
      setAmount(0);
    }, 2000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openRazorpayModal = (order: typeof activeOrder) => {
    if (!order || !member?._id) return;
    const options = {
      key:         order.keyId,
      amount:      order.amount,
      currency:    order.currency,
      name:        'IronForge Gym',
      description: `Membership — ${months} month(s)`,
      order_id:    order.orderId,
      prefill: { name: order.memberName, email: order.memberEmail, contact: order.memberPhone },
      theme: { color: '#C8F542' },
      handler: (response: any) => {
        if (!member?._id) return;
        dispatch(verifyRazorpayPayment({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          memberId:            member._id,
          amount, paymentForMonths: months, paymentMethod: 'online',
        }));
      },
      modal: { ondismiss: () => { dispatch(clearActiveOrder()); dispatch(clearError()); } },
    };
    new window.Razorpay(options).open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !member?._id) return;
    if (paymentMethod === 'online') {
      dispatch(createRazorpayOrder({ memberId: member._id, amount, paymentForMonths: months, paymentMethod }));
    } else {
      dispatch(processManualPayment({ memberId: member._id, amount, paymentForMonths: months, paymentMethod: paymentMethod as any }));
    }
  };

  const handleDeleteClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if ( !selectedPayment?._id || !member?._id) return;
    
    await dispatch(deletePayment({
      paymentId: selectedPayment._id,
      memberId: member._id,
      deletedReason: deleteReason || "Created by mistake",
    }));
    
    dispatch(fetchMemberPayments(member._id));
    setShowDeleteModal(false);
    setSelectedPayment(null);
    setDeleteReason('');
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .pay-input { width:100%; background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s; border-radius:2px; }
        .pay-input:focus { border-color:#C8F542; }
        .pay-input::placeholder { color:#444; }
        .pay-input option { background:#111; }
        .pay-label { font-family:'DM Sans',sans-serif; font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:#555; display:block; margin-bottom:0.4rem; }
        .pay-btn { background:#C8F542; color:#000; border:none; padding:0.85rem; width:100%; font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.85rem; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:opacity 0.2s; margin-top:1.5rem; }
        .pay-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pay-btn:hover:not(:disabled) { opacity:0.85; }
        .pay-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.5rem; }
        .success-box { background:rgba(200,245,66,0.08); border:1px solid rgba(200,245,66,0.2); padding:2rem; text-align:center; }
        .error-box { background:rgba(255,107,107,0.08); border:1px solid rgba(255,107,107,0.2); color:#ff6b6b; padding:0.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:0.85rem; margin-top:1rem; }
        .tab-btn { background:transparent; border:none; padding:0.6rem 1.25rem; font-family:'DM Sans',sans-serif; font-size:0.8rem; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; border-bottom:2px solid transparent; color:#555; }
        .tab-btn.active { color:#C8F542; border-bottom-color:#C8F542; }
        .tab-btn:hover:not(.active) { color:#888; }
        .history-row { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 0.5fr; gap:0.75rem; align-items:center; padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'DM Sans',sans-serif; font-size:0.8rem; }
        .history-row:last-child { border-bottom:none; }
        .p-badge { display:inline-block; padding:0.2rem 0.5rem; font-size:0.65rem; letter-spacing:1px; text-transform:uppercase; border-radius:2px; }
        .delete-btn { background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:1rem; padding:0.25rem 0.5rem; border-radius:2px; transition:all 0.2s; opacity:0.6; }
        .delete-btn:hover { opacity:1; background:rgba(255,107,107,0.1); }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:1000; display:flex; align-items:center; justify-content:center; }
        .modal-content { background:#111; border:1px solid rgba(255,255,255,0.1); max-width:450px; width:90%; padding:2rem; }
        .modal-title { font-family:"'Bebas Neue',sans-serif"; font-size:1.5rem; letter-spacing:2px; margin-bottom:1rem; color:#ff6b6b; }
        .modal-text { font-family:'DM Sans',sans-serif; font-size:0.85rem; color:#888; margin-bottom:1rem; line-height:1.5; }
        .modal-input { width:100%; background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.75rem; font-family:'DM Sans',sans-serif; font-size:0.85rem; margin:1rem 0; }
        .modal-buttons { display:flex; gap:1rem; margin-top:1.5rem; }
        .modal-btn { flex:1; padding:0.75rem; font-family:'DM Sans',sans-serif; font-size:0.8rem; letter-spacing:2px; text-transform:uppercase; cursor:pointer; border:none; transition:opacity 0.2s; }
        .modal-btn.confirm { background:#ff6b6b; color:#fff; }
        .modal-btn.cancel { background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; }
        .modal-btn:hover { opacity:0.8; }
        .deleted-text { text-decoration:line-through; opacity:0.7; }
      `}</style>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">DELETE PAYMENT</div>
            <div className="modal-text">
              Are you sure you want to delete this payment?
              <br /><br />
              <strong>Amount:</strong> ₹{selectedPayment?.amount?.toLocaleString('en-IN')}<br />
              <strong>Date:</strong> {selectedPayment?.createdAt && new Date(selectedPayment.createdAt).toLocaleDateString('en-IN')}<br />
              <strong>Method:</strong> {selectedPayment?.paymentMethod}<br />
              <strong>Months:</strong> {selectedPayment?.paymentForMonths} month(s)
            </div>
            <div className="modal-text" style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>
              ⚠️ This will revert the member's membership duration and remaining amount.
            </div>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Reason for deletion (optional)"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.08)', width:'100%', maxWidth:520, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'2rem 2rem 0', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'2px' }}>PAYMENT</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:'0.8rem', color:'#555' }}>{member.fullName}</div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'1.25rem' }}>✕</button>
          </div>

          {/* Member strip */}
          <div style={{ background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', padding:'0.75rem 1rem', marginBottom:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', fontFamily:'DM Sans,sans-serif', fontSize:'0.8rem' }}>
            <div>
              <div style={{ color:'#555', fontSize:'0.65rem', letterSpacing:'1px', textTransform:'uppercase' }}>Phone</div>
              <div style={{ color:'#fff', marginTop:2 }}>{member.phone || '—'}</div>
            </div>
            <div>
              <div style={{ color:'#555', fontSize:'0.65rem', letterSpacing:'1px', textTransform:'uppercase' }}>Ends</div>
              <div style={{ color:'#fff', marginTop:2 }}>
                {member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString('en-IN') : '—'}
              </div>
            </div>
            <div>
              <div style={{ color:'#555', fontSize:'0.65rem', letterSpacing:'1px', textTransform:'uppercase' }}>Due</div>
              <div style={{ color:'#ff6b6b', marginTop:2 }}>₹{member.remainingAmount?.toLocaleString('en-IN') ?? 0}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'1.5rem' }}>
            <button className={`tab-btn${tab === 'pay' ? ' active' : ''}`} onClick={() => setTab('pay')}>
              New Payment
            </button>
            <button className={`tab-btn${tab === 'history' ? ' active' : ''}`} onClick={() => { setTab('history'); dispatch(fetchMemberPayments(member._id)); }}>
              History ({payments.length})
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex:1, overflowY:'auto', padding:'0 2rem 2rem' }}>

          {/* ── PAY TAB ── */}
          {tab === 'pay' && (
            <>
              {successMessage ? (
                <div className="success-box">
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>✓</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#C8F542', letterSpacing:'2px' }}>PAYMENT RECORDED</div>
                  <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:'0.85rem', color:'#888', marginTop:'0.5rem' }}>
                    Receipt: <span style={{ color:'#C8F542' }}>{receiptNumber}</span>
                  </div>
                  <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:'0.75rem', color:'#555', marginTop:'0.5rem' }}>Switching to history...</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="pay-grid">
                    <div>
                      <label className="pay-label">Amount (₹) *</label>
                      <input type="number" min={1} className="pay-input" placeholder="e.g. 4999" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
                    </div>
                    <div>
                      <label className="pay-label">Months *</label>
                      <input type="number" min={1} max={24} className="pay-input" value={months} onChange={(e) => setMonths(Number(e.target.value))} required />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label className="pay-label">Payment Method</label>
                      <select className="pay-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {amount > 0 && (
                    <div style={{ marginTop:'1.25rem', padding:'0.75rem 1rem', background:'#0a0a0a', border:'1px solid rgba(200,245,66,0.12)', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'DM Sans,sans-serif', fontSize:'0.8rem' }}>
                      <span style={{ color:'#555' }}>{months} month{months > 1 ? 's' : ''} · {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</span>
                      <span style={{ color:'#C8F542', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.25rem', letterSpacing:'1px' }}>₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {error && (
                    <div className="error-box">
                      {error}
                      <span style={{ float:'right', cursor:'pointer' }} onClick={() => dispatch(clearError())}>✕</span>
                    </div>
                  )}

                  <button type="submit" className="pay-btn" disabled={isBusy || !amount}>
                    {isCreatingOrder    ? 'Opening Razorpay...'  :
                     isVerifying        ? 'Verifying Payment...' :
                     isProcessingManual ? 'Recording Payment...' :
                     paymentMethod === 'online' ? '💳 Pay with Razorpay' : '💵 Record Payment'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <>
              {isLoading ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif' }}>Loading history...</div>
              ) : payments.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#444', fontFamily:'DM Sans,sans-serif' }}>No payment history yet.</div>
              ) : (
                <div style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
                  {/* History header */}
                  <div className="history-row" style={{ background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    {['Date', 'Amount', 'Method', 'Status', ''].map(h => (
                      <div key={h} style={{ fontSize:'0.65rem', letterSpacing:'2px', textTransform:'uppercase', color:'#444', fontFamily:'DM Sans,sans-serif' }}>{h}</div>
                    ))}
                  </div>

                  {payments.map((payment) => (
                    <div key={payment._id} className="history-row">
                      <div style={{ color:'#888' }}>
                        {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                        <div style={{ fontSize:'0.7rem', color:'#555', marginTop:'2px' }}>
                          {payment.paymentForMonths} month{payment.paymentForMonths > 1 ? 's' : ''}
                        </div>
                        {payment.deletedReason && (
                          <div style={{ fontSize:'0.6rem', color:'#ff6b6b', marginTop:'4px' }}>
                            Deleted: {payment.deletedReason}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        color: payment.status === 'deleted' ? '#ff6b6b' : '#C8F542', 
                        fontFamily:"'Bebas Neue',sans-serif", 
                        fontSize:'1.1rem', 
                        letterSpacing:'1px',
                        textDecoration: payment.status === 'deleted' ? 'line-through' : 'none'
                      }}>
                        ₹{payment.amount?.toLocaleString('en-IN')}
                      </div>
                      <div>
                        <span className="p-badge" style={{ background:'rgba(255,255,255,0.06)', color:'#888' }}>
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="p-badge" style={{
                          background: payment.status === 'completed' ? 'rgba(200,245,66,0.1)' : 
                                     payment.status === 'deleted' ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,107,0.1)',
                          color: payment.status === 'completed' ? '#C8F542' : '#ff6b6b',
                        }}>
                          {payment.status === 'deleted' ? 'DELETED' : payment.status}
                        </span>
                      </div>
                      <div>
                        {payment.status !== 'deleted' && (
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDeleteClick(payment)}
                            title="Delete this payment (if created by mistake)"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div style={{ padding:'0.85rem 1rem', background:'#0a0a0a', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', fontFamily:'DM Sans,sans-serif', fontSize:'0.8rem' }}>
                    <span style={{ color:'#555', letterSpacing:'1px', textTransform:'uppercase', fontSize:'0.7rem' }}>Total Paid</span>
                    <span style={{ color:'#C8F542', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.25rem', letterSpacing:'1px' }}>
                      ₹{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}