import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';  // Assuming you're using react-toastify for toast messages
import Fuse from 'fuse.js';

const SeatingManagement = () => {
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: "Class 5A" },
    { id: 2, name: "Class 5B" },
    { id: 3, name: "Class 5C" },
    { id: 4, name: "Class 5D" },
    { id: 5, name: "Class 5E" },
    { id: 6, name: "Extra Room" }
  ]);

  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeatOccupied, setIsSeatOccupied] = useState(false);

  // Dummy data for fallback
  const dummyStudents = [
    { id: 1, name: "Aman", userClass: "5A", house: "Blue", assigned: false },
    { id: 2, name: "Aamar", userClass: "5A", house: "Red", assigned: false },
    // Add more students as needed
  ];

  useEffect(() => {
    let mounted = true;
    
    const fetchStudents = async () => {
      console.log('Fetching students...'); // Debug log
      
      if (!mounted) return;
      
      try {
        const response = await axios.get('http://localhost:8081/principal/get-student-scores');
        if (mounted) {
          const transformedData = response.data.map(student => ({
            id: student.username, // Using username as id
            name: student.name,
            userClass: student.userClass,
            house: student.house,
            assigned: student.classAllocated ? true : false,
            classAllocated: student.classAllocated,
            seatRow: student.seatRow,
            seatColumn: student.seatColumn
          }));
          // Initialize classrooms with allocated seats
          const updatedClassrooms = classrooms.map(classroom => {
            const allocatedStudents = transformedData.filter(
              student => student.classAllocated === classroom.name
            );
            
            const seats = Array(25).fill(null).map((_, index) => ({
              row: Math.floor(index / 5),
              column: index % 5,
              student: null
            }));
            
            allocatedStudents.forEach(student => {
              if (student.seatRow !== null && student.seatColumn !== null) {
                console.log("student  ", student);
                seats[student.seatRow * 5 + student.seatColumn] = {
                  ...seats[student.seatRow * 5 + student.seatColumn],
                  student
                };
              }
            });
            
            return { ...classroom, seats };
          });
          setClassrooms(updatedClassrooms);
          setStudents(transformedData);
          setOriginalStudents(transformedData);
        }
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        if (mounted) {
          setStudents(dummyStudents);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array

  const isValidPlacement = (student, row, col, classroom) => {
    const sameClassInRowCol = classroom.seats?.some(seat => 
      seat.student && 
      seat.student.userClass === student.userClass && 
      (seat.row === row || seat.column === col)
    );

    const adjacentPositions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    const sameHouseAdjacent = adjacentPositions.some(([rowOffset, colOffset]) => {
      const adjRow = row + rowOffset;
      const adjCol = col + colOffset;

      if (adjRow < 0 || adjRow >= 5 || adjCol < 0 || adjCol >= 5) return false;

      return classroom.seats?.some(seat =>
        seat.row === adjRow &&
        seat.column === adjCol &&
        seat.student?.house === student.house
      );
    });

    return !sameClassInRowCol && !sameHouseAdjacent;
  };

  const checkSeatOccupancy = async (row, col) => {
    if (!selectedClassroom) return;

    try {
      const response = await axios.get(`http://localhost:8081/api/seat/${selectedClassroom.id}/${row}/${col}`);
      if (response.data.isOccupied) {
        toast.error('This seat is already taken!', { position: toast.POSITION.TOP_RIGHT });
        setIsSeatOccupied(true);
      } else {
        setIsSeatOccupied(false);
      }
    } catch (error) {
      console.error('Error checking seat occupancy:', error);
      setIsSeatOccupied(false);
    }
  };

  const handleSeatClick = (row, col) => {
    if (!selectedClassroom) return;

    // Check seat occupancy
    checkSeatOccupancy(row, col);
    setSelectedSeat({ row, col });
    const validStudents = originalStudents.filter(student => 
      student && !student.assigned && 
      isValidPlacement(student, row, col, selectedClassroom)
    );
    setStudents(validStudents);
  };

  const handleStudentSelect = async (student) => {
    if (!selectedSeat || !selectedClassroom || isSeatOccupied) return;

    if (!isValidPlacement(student, selectedSeat.row, selectedSeat.col, selectedClassroom)) {
      alert('Invalid placement! Check class and house rules.');
      return;
    }

    try {
      // Call API to update seat allocation
    
      const response = await axios.post(
        'http://localhost:8081/principal/allocate-seat',
        null,
        {
          params: {
            studentUsername: student.id,
            classroomName: selectedClassroom.name,
            seatRow: selectedSeat.row,
            seatColumn: selectedSeat.col
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {

        // Update local state
        const updatedClassrooms = classrooms.map(classroom => {
          if (classroom.id === selectedClassroom.id) {
            const seats = classroom.seats || Array(25).fill(null).map((_, index) => ({
              row: Math.floor(index / 5),
              column: index % 5,
              student: null
            }));
  
            seats[selectedSeat.row * 5 + selectedSeat.col] = {
              ...seats[selectedSeat.row * 5 + selectedSeat.col],
              student
            };
  
            return { ...classroom, seats };
          }
          return classroom;
        });
  
        setClassrooms(updatedClassrooms);
        
        // Update student allocation status
        const updatedStudents = originalStudents.map(s => 
          s.id === student.id ? { 
            ...s, 
            assigned: true,
            classAllocated: selectedClassroom.id,
            seatRow: selectedSeat.row,
            seatColumn: selectedSeat.col
          } : s
        );
        
        setStudents(updatedStudents);
        setOriginalStudents(updatedStudents);
        setSelectedClassroom(updatedClassrooms.find(c => c.id === selectedClassroom.id));
        setSelectedSeat(null);
        alert(`Seat allocated for ${student.name}`);
        toast.success(`Seat allocated for ${student.name}`);
      }
    } catch (error) {
      console.error('Failed to allocate seat:', error);
      toast.error('Failed to allocate seat');
    }
  };

  // Fuzzy search setup
  const fuse = new Fuse(students, {
    keys: ['name', 'userClass', 'house'],
    threshold: 0.3, // Adjust the threshold as needed
  });

  const filteredStudents = searchQuery ? fuse.search(searchQuery).map(result => result.item) : students;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Seating Management</h2>
      
      {/* Classroom Selection */}
      <div className="mb-6 flex gap-4">
        {classrooms.map(classroom => (
          <button
            key={classroom.id}
            className={`px-4 py-2 rounded ${
              selectedClassroom?.id === classroom.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedClassroom(classroom)}
          >
            {classroom.name}
          </button>
        ))}
      </div>

      {selectedClassroom && (
        <div className="flex gap-6">
          {/* Seating Grid */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">{selectedClassroom.name} - Seating Plan</h3>
            <div className="grid grid-cols-5 gap-2 bg-gray-100 p-4 rounded">
              {Array(25).fill(null).map((_, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                const seat = selectedClassroom.seats?.[index];
                
                return (
                  <div
                    key={index}
                    onClick={() => handleSeatClick(row, col)}
                    className={`
                      h-24 p-2 rounded cursor-pointer
                      ${seat?.student 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-white hover:bg-gray-50'
                      }
                      ${selectedSeat?.row === row && selectedSeat?.col === col 
                        ? 'ring-2 ring-blue-500' 
                        : ''
                      }
                    `}
                  >
                    <div className="text-sm text-gray-700">{`${row+1},${col+1}`}</div>
                    {seat?.student && (
                      <div className="text-sm">
                        <p className="font-medium">{seat.student.name}</p>
                        <p className="text-gray-600">Class: {seat.student.userClass}</p>
                        <p className="text-gray-600">House: {seat.student.house}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Selection */}
          {selectedSeat && !isSeatOccupied && (
            <div className="w-80 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Select Student</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full p-2 border rounded"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredStudents
                  .map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        Class: {student.userClass} | House: {student.house}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* If seat is occupied */}
          {isSeatOccupied && (
            <div className="text-red-500 mt-4">Seat is already taken. Please select another seat.</div>
          )}
        </div>
      )}

      {loading && <div>Loading students...</div>}
    </div>
  );
};

export default SeatingManagement;