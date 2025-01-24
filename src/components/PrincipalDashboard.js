import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Fuse from 'fuse.js';

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null);  // For handling errors

  // Dummy data for fallback
  const dummyData = [
    { id: 1, name: 'Aman', rollNumber: '001', userClass: '5A', house: 'Blue' },
    { id: 2, name: 'Aamar', rollNumber: '002', userClass: '5A', house: 'Red' },
    // Add more dummy data as needed
  ];

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8081/principal/get-student-scores'); // Replace with your API endpoint
        if (response.data && response.data.length > 0) {
          setStudents(response.data);
        } else {
          setStudents(dummyData); // Fallback to dummy data if no data from API
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents(dummyData); // Fallback to dummy data in case of error
        // setError('Failed to fetch student data, showing dummy data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    // Clear all session storage
    sessionStorage.clear();
    // Navigate to login
    navigate('/login');
  };

  // Fuzzy search setup
  const fuse = new Fuse(students, {
    keys: ['name', 'rollNumber', 'userClass', 'house'],
    threshold: 0.3, // Adjust the threshold as needed
  });

  const filteredStudents = searchQuery ? fuse.search(searchQuery).map(result => result.item) : students;

  return (
    <div className="p-6">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Navigation buttons */}
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

      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Table of students */}
      {loading ? (
        <div>Loading students...</div>
      ) : (
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="px-6 py-4">{student.rollNumber}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{student.userClass}</td>
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
      )}
    </div>
  );
};

export default PrincipalDashboard;
