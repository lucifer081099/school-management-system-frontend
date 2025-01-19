import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = ({ onLogout }) => {
  // This will be replaced with API data later
  const [studentData, setStudentData] = useState({
    name: "John Doe",
    rollNumber: "2024001",
    class: "5A",
    house: "Blue",
    examSeat: {
      classroom: "Room 102",
      row: 2,
      column: 3
    },
    enrolledSubjects: [
      { id: 1, name: "Mathematics", score: 85 },
      { id: 2, name: "Science", score: 92 },
      { id: 3, name: "English", score: 88 }
    ],
    availableSubjects: [
      { id: 4, name: "History" },
      { id: 5, name: "Geography" },
      { id: 6, name: "Art" }
    ]
  });
  
  const navigate = useNavigate();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const handleEnroll = async (subjectId) => {
    try {
        const response = await axios.post(
            'http://localhost:8081/student/enroll', 
            { subjectId }, 
            { headers: { 'Content-Type': 'application/json' } }
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
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{studentData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll Numbers</p>
              <p className="font-medium">{studentData.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{studentData.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">House</p>
              <p className="font-medium">{studentData.house}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
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
        </div>

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
              <tbody className="bg-white divide-y divide-gray-200">
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
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEnrollModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enroll in New Subject</h3>
            <div className="space-y-4">
              {studentData.availableSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span>{subject.name}</span>
                  <button onClick={() => handleEnroll(subject.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Enroll
                  </button>
                </div>
              ))}
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