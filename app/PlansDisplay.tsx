'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPlans } from '@/store/Slices/PlansSlice';

interface DisplayPlan {
  id: string;
  name: string;
  duration: string;
  tag: string | null;
  price: number;
  color: string;
  features: string[];
  highlight: boolean;
}

export default function PlansDisplay() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans: plansData, isLoading, error } = useSelector(
    (state: RootState) => state.plans
  );
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const transformedPlans: DisplayPlan[] = plansData.map((plan) => {
    let highlight = false;
    let tag: string | null = null;

    if (plan.durationMonths === 6) { highlight = true; tag = 'Most Popular'; }
    else if (plan.durationMonths === 12) { tag = 'Best Value'; }
    else if (plan.durationMonths === 1) { tag = 'Try it out'; }

    return {
      id: plan._id,
      name: plan.name,
      duration: `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''}`,
      tag,
      price: plan.price,
      color: '#C8F542',
      features: plan.features,
      highlight,
    };
  });

  if (isLoading) return (
    <div style={{ color: '#fff', textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏋️</div>
      <p>Loading plans...</p>
    </div>
  );

  if (error) return (
    <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '4rem' }}>
      <p>{error}</p>
      <button
        onClick={() => dispatch(fetchPlans())}
        style={{ background: '#C8F542', color: '#000', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer', marginTop: '1rem' }}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="plans-grid">
      {transformedPlans.map((plan) => (
        <div
          key={plan.id}
          className={`plan-card${plan.highlight ? ' highlighted' : ''}${hovered === plan.id ? ' hovered-card' : ''}`}
          onMouseEnter={() => setHovered(plan.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {plan.tag ? <div className="plan-tag">{plan.tag}</div> : <div className="plan-tag-spacer" />}
          <div className="plan-duration">{plan.duration}</div>
          <div className="plan-name">{plan.name.toUpperCase()}</div>
          <div className="plan-price-block">
            <div className="plan-price">₹{plan.price.toLocaleString('en-IN')}</div>
            <div className="plan-period">one-time payment</div>
          </div>
          <div className="plan-divider" />
          <ul className="plan-features">
            {plan.features.map((feature, idx) => <li key={idx}>{feature}</li>)}
          </ul>
          <button className="plan-cta">Get Started</button>
        </div>
      ))}
    </div>
  );
}