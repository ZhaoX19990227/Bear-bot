import React, { useState, useEffect } from 'react';
import './PawPrints.css';

const PawPrints = () => {
  const [pawPrints, setPawPrints] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const newPaw = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setPawPrints(prev => [...prev, newPaw]);
      
      setTimeout(() => {
        setPawPrints(prev => prev.filter(paw => paw.id !== newPaw.id));
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      {pawPrints.map(paw => (
        <div
          key={paw.id}
          className="paw-print"
          style={{
            left: paw.x - 10,
            top: paw.y - 10
          }}
        >
          🐾
        </div>
      ))}
    </>
  );
};

export default PawPrints;