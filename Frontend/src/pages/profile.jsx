import React, { useState } from 'react';

export default function BusinessProfile() {
  const [profile, setProfile] = useState({
    businessName: '',
    gstNumber: '',
    address: '',
    profileID: '',
    contactNumber: '',
    logoURL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(profile);
    alert('Profile saved!');
    
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Business Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
       <input
  type="text"
  name="businessName"
  placeholder="Business Name"
  value={profile.businessName}
  onChange={handleChange}
  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  required
/>

        <input
          type="text"
          name="gstNumber"
          placeholder="GST Number"
          value={profile.gstNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={profile.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="profileID"
          placeholder="Profile ID"
          value={profile.profileID}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={profile.contactNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="url"
          name="logoURL"
          placeholder="Logo URL"
          value={profile.logoURL}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {profile.logoURL && (
  <img src={profile.logoURL} alt="Business Logo" className="h-20 mt-2 mx-auto" />
)}

        <button
          type="submit"
     className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"

        >
          Save Profile
        </button>
      </form>
    </div>
  );
}  