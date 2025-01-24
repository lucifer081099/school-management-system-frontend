import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import Fuse from 'fuse.js';

const ScoreManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]); // Dynamic data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data in case the API call fails
  const dummyData = [
    {
      id: 1,
      name: "Aman",
      userClass: "5A",
      subjects: [
        { name: "Mathematics", score: null },
        { name: "Science", score: null },
        { name: "English", score: null }
      ]
    },
    {
      id: 2,
      name: "Aamar",
      userClass: "5B",
      subjects: [
        { name: "Mathematics", score: 80 },
        { name: "Science", score: 85 },
        { name: "English", score: 90 }
      ]
    }
  ];

  const transformStudentsData = (data) => {
    // List of all possible subjects
    const subjects = [
      { key: 'english', name: 'English' },
      { key: 'hindi', name: 'Hindi' },
      { key: 'mathematics', name: 'Mathematics' },
      { key: 'science', name: 'Science' },
      { key: 'history', name: 'History' },
      { key: 'economics', name: 'Economics' }
    ];
  
    return data.map(student => {
      const studentSubjects = [];
      
      subjects.forEach(subject => {
        if (student[subject.key] !== null) {
          studentSubjects.push({
            name: subject.name,
            score: student[subject.key]
          });
        }
      });
  
      return {
        id: student.id || Math.random(),
        name: student.name,
        userClass: student.userClass,
        subjects: studentSubjects
      };
    });
  };

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8081/principal/get-student-scores');
        const transformedData = transformStudentsData(response.data);
        console.log('Fetched students:', transformedData);
        setStudents(transformedData);
        setLoading(false);
      } catch (err) {
        // setError('Failed to fetch student data');
        setStudents(dummyData); // Use dummy data if API call fails
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleScoreUpdate = async (studentName, subjectName, newScore) => {
    try {
      if (newScore < 0 || newScore > 100) {
        alert('Score must be between 0 and 100');
        return;
      }

      const response = await axios.post(
        'http://localhost:8081/principal/update-score',
        null,
        {
          params: {
            studentName: studentName,
            subjectName: subjectName,
            score: parseInt(newScore),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Score updated successfully');
        console.log(
          `Updated score for student ${studentName}, subject ${subjectName}: ${newScore}`
        );
      }
    } catch (error) {
      if (error.response) {
        alert(`Server Error: ${error.response.data.message || 'Unknown error occurred'}`);
      } else if (error.request) {
        alert('Network error - please check your connection');
      } else {
        alert(`Error: ${error.message}`);
      }
      console.error('Score update failed:', error);
    }
  };

  // Fuzzy search setup
  const fuse = new Fuse(students, {
    keys: ['name', 'userClass', 'subjects.name'],
    threshold: 0.3, // Adjust the threshold as needed
  });

  const filteredStudents = searchQuery ? fuse.search(searchQuery).map(result => result.item) : students;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Score Management</h2>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search students..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-gray-600">Class: {student.userClass}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(student)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Scores
              </button>
            </div>

            {selectedStudent?.name === student.name && (
              <div className="mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Score</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {selectedStudent?.subjects?.map((subject) => (
                    <tr key={subject.name} className="border-t">
                      <td className="px-4 py-2">{subject.name}</td>
                      <td className="px-4 py-2">
                        {subject.score !== '0' ? `${subject.score}%` : 'Not graded'}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 p-1 border rounded"
                          placeholder="Score"
                          onBlur={(e) =>
                            handleScoreUpdate(
                              student.name,
                              subject.name,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreManagement;