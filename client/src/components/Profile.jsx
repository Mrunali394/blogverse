import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/profile/${id}`);
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={profile.profilePicture || '/default-avatar.png'} 
          alt={profile.username} 
          className="profile-picture"
        />
        <h1>{profile.username}</h1>
        <p>{profile.email}</p>
      </div>
      
      <div className="profile-details">
        {profile.bio && <p className="bio">{profile.bio}</p>}
        {profile.location && <p className="location">📍 {profile.location}</p>}
        {profile.website && (
          <p className="website">
            🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer">
              {profile.website}
            </a>
          </p>
        )}
        <p className="joined">
          Joined: {new Date(profile.joinedDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Profile;
