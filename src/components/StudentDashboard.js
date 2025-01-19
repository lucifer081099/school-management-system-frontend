import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = ({ onLogout }) => {
  const [studentData, setStudentData] = useState(null); // Initialize as null for better loading state handling
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
    

        const response = await axios.get('http://localhost:8081/student/details', {
          params: {
            studentName: sessionStorage.getItem('username')
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          setStudentData(response.data); // Update studentData with API response
        } else {
          console.error('Failed to fetch student details:', response.statusText);
          setDummyData(); // Use dummy data if API fails
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        setDummyData(); // Use dummy data in case of error
      }
    };

    const setDummyData = () => {
      setStudentData({
        name: 'Dummy User',
        rollNumber: '999999',
        class: '10B',
        house: 'Green',
        examSeat: {
          classroom: 'Room 999',
          row: 5,
          column: 7,
        },
        enrolledSubjects: [
          { id: 1, name: 'Mathematics', score: 90 },
          { id: 2, name: 'Science', score: 85 },
        ],
        availableSubjects: [
          { id: 3, name: 'History' },
          { id: 4, name: 'Geography' },
        ],
      });
    };

    fetchStudentDetails();
  }, [navigate]);

  const handleEnroll = async (subjectId) => {
    try {
      const response = await axios.post(
        'http://localhost:8081/student/enroll',
        { subjectId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`, // Use sessionStorage
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setStudentData((prevState) => ({
          ...prevState,
          enrolledSubjects: [...prevState.enrolledSubjects, data.enrolledSubject],
          availableSubjects: prevState.availableSubjects.filter((subject) => subject.id !== subjectId),
        }));
        alert('Enrollment successful!');
      } else {
        alert(`Error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to enroll in subject:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  if (!studentData) {
    return <div>Loading...</div>; // Show a loading indicator while fetching data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{studentData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="font-medium">{studentData.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{studentData.userClass}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">House</p>
              <p className="font-medium">{studentData.house}</p>
            </div>
          </div>
        </div>

        {/* Exam Seat Allocation */}
        {/* <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Exam Seat Allocation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Classroom</p>
              <p className="font-medium">{studentData.examSeat.classroom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Row</p>
              <p className="font-medium">{studentData.examSeat.row + 1}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Column</p>
              <p className="font-medium">{studentData.examSeat.column + 1}</p>
            </div>
          </div>
        </div> */}

        {/* Enrolled Subjects */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Enrolled Subjects</h2>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enroll in New Subject
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              {/* <tbody className="bg-white divide-y divide-gray-200">
                {studentData.enrolledSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subject.score !== null ? `${subject.score}%` : 'Not graded'}
                    </td>
                  </tr>
                ))}
              </tbody> */}
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Mathematics</td>
                  <td className="px-6 py-4 whitespace-nowrap">85%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Science</td>
                  <td className="px-6 py-4 whitespace-nowrap">90%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">English</td>
                  <td className="px-6 py-4 whitespace-nowrap">78%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">History</td>
                  <td className="px-6 py-4 whitespace-nowrap">Not graded</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enroll in New Subject</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span>Mathematics</span>
                <button
                  onClick={() => handleEnroll(1)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span>Science</span>
                <button
                  onClick={() => handleEnroll(2)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span>English</span>
                <button
                  onClick={() => handleEnroll(3)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span>History</span>
                <button
                  onClick={() => handleEnroll(4)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
