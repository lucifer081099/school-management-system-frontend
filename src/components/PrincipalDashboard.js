import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated data - we'll replace this with API calls later
  useEffect(() => {
    const dummyData = [
      { id: 1, name: 'John Doe', rollNumber: '001', class: '5A', house: 'Blue' },
      { id: 2, name: 'Jane Smith', rollNumber: '002', class: '5A', house: 'Red' },
      // Add more dummy data as needed
    ];
    setStudents(dummyData);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // We'll implement the Solr search here later
  };

  return (
    <div className="p-6">
      {/* <h1 className="text-3xl font-bold mb-6">Principal Dashboard</h1> */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => navigate('/principal/seating-management')}
        >
          Manage Seating
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => navigate('/principal/score-management')}
        >
          Add Scores
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Roll Number</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Class</th>
              <th className="px-6 py-3 text-left">House</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="px-6 py-4">{student.rollNumber}</td>
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">{student.class}</td>
                <td className="px-6 py-4">{student.house}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrincipalDashboard;