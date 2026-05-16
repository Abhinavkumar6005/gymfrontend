'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchTrainers, fetchTrainersBySpecialization } from '@/store/Slices/trainerSlice';

export default function TrainersDisplay() {
  const dispatch = useDispatch<AppDispatch>();
  const { trainers, isLoading, error } = useSelector((state: RootState) => state.trainers);
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [hoveredTrainer, setHoveredTrainer] = useState(null);

  const specializations = [
    'all',
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

  useEffect(() => {
    fetchTrainerData();
  }, [selectedSpecialization]);

  const fetchTrainerData = () => {
    if (selectedSpecialization === 'all') {
      dispatch(fetchTrainers());
    } else {
      dispatch(fetchTrainersBySpecialization(selectedSpecialization));
    }
  };

  if (isLoading) {
    return (
      <div className="trainers-loading">
        <div className="loading-spinner"></div>
        <p>Loading trainers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trainers-loading">
        <p style={{ color: '#ff6b6b' }}>Error loading trainers: {error}</p>
      </div>
    );
  }

  return (

    <div className="trainers-section ">
      <style jsx>{`
        .trainers-section {
          margin-top: 4rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 1rem;
        }

        .specialization-filter {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
          justify-content: center;
        }

        .filter-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #888;
          padding: 0.5rem 1.25rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 30px;
        }

        .filter-btn:hover,
        .filter-btn.active {
          border-color: #C8F542;
          color: #C8F542;
          background: rgba(200,245,66,0.05);
        }

        .trainers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .trainer-card {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 8px;
        }

        .trainer-card:hover {
          transform: translateY(-5px);
          border-color: rgba(200,245,66,0.3);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .trainer-image {
          width: 100%;
          height: 300px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .trainer-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trainer-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
        }

        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.3;
        }

        .trainer-info {
          padding: 1.5rem;
        }

        .trainer-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
        }

        .trainer-specialization {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #C8F542;
          margin-bottom: 0.75rem;
        }

        .trainer-certification {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .trainer-experience {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          color: #888;
          margin-bottom: 1rem;
        }

        .trainer-bio {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #888;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .trainer-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stars {
          color: #C8F542;
          font-size: 0.9rem;
        }

        .clients {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          color: #666;
        }

        .loading-spinner {
          border: 3px solid rgba(200,245,66,0.1);
          border-top: 3px solid #C8F542;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .trainers-loading {
          text-align: center;
          padding: 4rem;
          color: #666;
        }
      `}</style>


     {trainers.length > 0 ? (
       <> <div className="specialization-filter">
        {/* {specializations.map(spec => (
          <button
            key={spec}
            className={`filter-btn ${selectedSpecialization === spec ? 'active' : ''}`}
            onClick={() => setSelectedSpecialization(spec)}
          >
            {spec === 'all' ? 'All' : spec}
          </button>
        ))} */}
      </div>

      <div className="trainers-grid">
        {trainers.map((trainer) => (
          <div
            key={trainer._id}
            className="trainer-card"
            onMouseEnter={() => setHoveredTrainer(trainer._id)}
            onMouseLeave={() => setHoveredTrainer(null)}
          >
            <div className="trainer-image">
              {trainer.photo ? (
                <img src={trainer.photo} alt={trainer.fullName} />
              ) : (
                <div className="trainer-image-placeholder">
                  <div className="placeholder-icon">🏋️</div>
                </div>
              )}
            </div>
            <div className="trainer-info">
              <div className="trainer-name">{trainer.fullName}</div>
              <div className="trainer-specialization">{trainer.specialization}</div>
              <div className="trainer-certification">📜 {trainer.certification}</div>
              <div className="trainer-experience">⭐ {trainer.experience}+ years experience</div>
              {trainer.bio && (
                <div className="trainer-bio">
                  {trainer.bio.length > 100 ? `${trainer.bio.substring(0, 100)}...` : trainer.bio}
                </div>
              )}
              <div className="trainer-stats">
                <div className="rating">
                  <span className="stars">★</span>
                  <span>{trainer.rating || 0}</span>
                </div>
                <div className="clients">{trainer.totalClients || 0} clients</div>
              </div>
            </div>
          </div>
        ))}
      </div></>
      ) : (
        <></>
      )}
     

   
    </div>
  );
}