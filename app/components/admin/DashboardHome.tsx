'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMembers, fetchExpiringMembers } from '@/store/Slices/membersSlice';
import { fetchTrainers } from '@/store/Slices/trainerSlice';
import { fetchMemberPayments } from '@/store/Slices/paymentsSlice';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { members, expiringMembers, isLoading, isLoadingExpiring } = useSelector((state: RootState) => state.members);
  const { trainers, isLoading: trainersLoading } = useSelector((state: RootState) => state.trainers);
  const { payments, isLoading: paymentsLoading } = useSelector((state: RootState) => state.payments);

  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [expiringList, setExpiringList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all data
    dispatch(fetchMembers());
    dispatch(fetchExpiringMembers());
    dispatch(fetchTrainers());
  }, []);

  // Handle expiring members data
  useEffect(() => {
    if (expiringMembers) {
      // Check if expiringMembers is an array, if not, try to extract it
      if (Array.isArray(expiringMembers)) {
        setExpiringList(expiringMembers);
      } else if (expiringMembers && typeof expiringMembers === 'object') {
        // If it's an object with members property
        if (expiringMembers.members && Array.isArray(expiringMembers.members)) {
          setExpiringList(expiringMembers.members);
        } 
        // If it's an object with data property
        else if (expiringMembers.data && Array.isArray(expiringMembers.data)) {
          setExpiringList(expiringMembers.data);
        }
        // If it's a single object, put in array
        else if (expiringMembers._id) {
          setExpiringList([expiringMembers]);
        } else {
          setExpiringList([]);
        }
      } else {
        setExpiringList([]);
      }
    } else {
      setExpiringList([]);
    }
  }, [expiringMembers]);

  // Handle recent payments
  useEffect(() => {
    const fetchAllPayments = async () => {
      if (members.length === 0) return;
      
      const allPayments: any[] = [];
      for (const member of members) {
        try {
          const result = await dispatch(fetchMemberPayments(member._id)).unwrap();
          if (Array.isArray(result)) {
            allPayments.push(...result);
          } else if (result && result.payments && Array.isArray(result.payments)) {
            allPayments.push(...result.payments);
          } else if (result && result.data && Array.isArray(result.data)) {
            allPayments.push(...result.data);
          }
        } catch (error) {
          console.error('Error fetching payments for member:', member._id);
        }
      }
      // Sort and get latest 5 payments
      const sorted = allPayments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentPayments(sorted.slice(0, 5));
    };
    
    fetchAllPayments();
  }, [members]);

  // Calculate stats
  const totalMembers = Array.isArray(members) ? members.length : 0;
  const totalTrainers = Array.isArray(trainers) ? trainers.length : 0;
  const activeMembers = Array.isArray(members) ? members.filter(m => m.status === 'active').length : 0;
  const expiredMembers = Array.isArray(members) ? members.filter(m => m.status === 'expired').length : 0;
  const expiringCount = expiringList.length;
  const totalRevenue = Array.isArray(members) ? members.reduce((sum, member) => sum + (member.amountPaid || 0), 0) : 0;

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMemberName = (payment: any) => {
    if (typeof payment.memberId === 'object' && payment.memberId !== null) {
      return (payment.memberId as any).name || (payment.memberId as any).fullName || 'Unknown';
    }
    return 'Member';
  };

  const isLoadingAll = isLoading || trainersLoading || isLoadingExpiring || paymentsLoading;

  if (isLoadingAll) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#0a0a0a', 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        .stat-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          border-color: rgba(200,245,66,0.3);
          transform: translateY(-2px);
        }
        
        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.5rem;
          letter-spacing: 2px;
          color: #C8F542;
        }
        
        .stat-label {
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
          margin-top: 0.5rem;
        }
        
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
          color: #fff;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
          gap: 1rem;
          padding: 1rem;
          background: #111;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.85rem;
          transition: background 0.2s;
          align-items: center;
        }
        
        .table-row:hover {
          background: rgba(255,255,255,0.02);
        }
        
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          font-size: 0.65rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 2px;
        }
        
        .badge-warning {
          background: rgba(255,193,7,0.1);
          color: #ffc107;
          border: 1px solid rgba(255,193,7,0.2);
        }
        
        .badge-danger {
          background: rgba(255,107,107,0.1);
          color: #ff6b6b;
          border: 1px solid rgba(255,107,107,0.2);
        }
        
        .badge-success {
          background: rgba(200,245,66,0.1);
          color: #C8F542;
          border: 1px solid rgba(200,245,66,0.2);
        }
        
        .grid-2cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .grid-2cols {
            grid-template-columns: 1fr;
          }
          .stat-card {
            padding: 1rem;
          }
          .stat-value {
            font-size: 1.8rem;
          }
          .table-header, .table-row {
            grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
            gap: 0.5rem;
            font-size: 0.7rem;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: "'Bebas Neue', sans-serif", 
          fontSize: '3rem', 
          letterSpacing: '3px',
          marginBottom: '0.5rem',
          color: '#fff'
        }}>
          DASHBOARD
        </h1>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          Overview of gym performance and member activity
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card">
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{totalTrainers}</div>
          <div className="stat-label">Total Trainers</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{activeMembers}</div>
          <div className="stat-label">Active Members</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ff6b6b' }}>{expiredMembers}</div>
          <div className="stat-label">Expired Members</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ffc107' }}>{expiringCount}</div>
          <div className="stat-label">Expiring in 5 Days</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid-2cols">
        {/* Members Expiring Soon - from fetchExpiringMembers API */}
        <div>
          <div className="section-title">⚠️ MEMBERSHIP EXPIRING SOON (Next 5 days)</div>
          {isLoadingExpiring ? (
            <div style={{ 
              background: '#111', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#555'
            }}>
              Loading expiring members...
            </div>
          ) : expiringList.length === 0 ? (
            <div style={{ 
              background: '#111', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#555'
            }}>
              No members expiring in the next 5 days
            </div>
          ) : (
            <div style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="table-header">
                <div>Member Name</div>
                <div>Phone</div>
                <div>Expires On</div>
                <div>Days Left</div>
              </div>
              {expiringList.map((member) => (
                <div key={member._id} className="table-row">
                  <div style={{ color: '#fff', fontWeight: 500 }}>{member.name || member.fullName}</div>
                  <div style={{ color: '#888' }}>{member.phone || '—'}</div>
                  <div style={{ color: '#ffc107' }}>
                    {member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString('en-IN') : '—'}
                  </div>
                  <div>
                    <span className="badge badge-warning">
                      {getDaysRemaining(member.membershipEnd)} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments - from fetchMemberPayments API */}
        <div>
          <div className="section-title">💰 RECENT PAYMENTS</div>
          {paymentsLoading ? (
            <div style={{ 
              background: '#111', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#555'
            }}>
              Loading recent payments...
            </div>
          ) : recentPayments.length === 0 ? (
            <div style={{ 
              background: '#111', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#555'
            }}>
              No recent payments found
            </div>
          ) : (
            <div style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="table-header">
                <div>Member Name</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Date</div>
              </div>
              {recentPayments.map((payment) => (
                <div key={payment._id} className="table-row">
                  <div style={{ color: '#fff' }}>{getMemberName(payment)}</div>
                  <div style={{ color: '#C8F542', fontWeight: 'bold' }}>
                    ₹{payment.amount?.toLocaleString('en-IN')}
                  </div>
                  <div>
                    <span className="badge badge-success">{payment.paymentMethod}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: '0.75rem' }}>
                    {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Members List */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-title">📋 ALL MEMBERS</div>
        {isLoading ? (
          <div style={{ 
            background: '#111', 
            padding: '2rem', 
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#555'
          }}>
            Loading members...
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', maxHeight: '400px', overflowY: 'auto' }}>
            <div className="table-header">
              <div>Name</div>
              <div>Phone</div>
              <div>Status</div>
              <div>Membership End</div>
            </div>
            {Array.isArray(members) && members.map((member) => (
              <div key={member._id} className="table-row">
                <div style={{ color: '#fff' }}>{member.name || member.fullName}</div>
                <div style={{ color: '#888' }}>{member.phone || '—'}</div>
                <div>
                  <span className={`badge ${
                    member.status === 'active' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {member.status}
                  </span>
                </div>
                <div style={{ color: '#888' }}>
                  {member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString('en-IN') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trainers Section */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-title">💪 TRAINERS</div>
        {trainersLoading ? (
          <div style={{ 
            background: '#111', 
            padding: '2rem', 
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#555'
          }}>
            Loading trainers...
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="table-header">
              <div>Name</div>
              <div>Specialization</div>
              <div>Phone</div>
              <div>Status</div>
            </div>
            {Array.isArray(trainers) && trainers.map((trainer) => (
              <div key={trainer._id} className="table-row">
                <div style={{ color: '#fff' }}>{trainer.name || trainer.fullName}</div>
                <div style={{ color: '#888' }}>{trainer.specialization || '—'}</div>
                <div style={{ color: '#888' }}>{trainer.phone || '—'}</div>
                <div>
                  <span className={`badge ${
                    trainer.status === 'active' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {trainer.status || 'active'}
                  </span>
                </div>
              </div>
            ))}
            {(!trainers || trainers.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>
                No trainers added yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}