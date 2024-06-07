import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Class {
  id: number;
}

interface Props {
  onSelect: (classId: number) => void;
}

const ClassDropdown: React.FC<Props> = ({ onSelect }) => {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    axios.get<Class[]>('http://localhost:5000/classes')
      .then(response => {
        setClasses(response.data);
      })
      .catch(error => {
        console.error('Error fetching classes:', error);
      });
  }, []);

  return (
    <select className='class-dropdown' onChange={(e) => onSelect(Number(e.target.value))}>
      <option value="">Select a class</option>
      {classes.map((classItem) => (
        <option key={classItem.id} value={classItem.id}>{classItem.id}</option>
      ))}
    </select>
  );
};

export default ClassDropdown;
