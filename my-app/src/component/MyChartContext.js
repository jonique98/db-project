import React, { createContext, useContext, useState } from 'react';

export const MyChartContext = createContext();

export const MyChartProvider = ({ children }) => {
  const [myChartData, setMyChartData] = useState([]);

  const updateMyChart = (newData) => {
    setMyChartData(newData);
  };

  return (
    <MyChartContext.Provider value={{ myChartData, updateMyChart }}>
      {children}
    </MyChartContext.Provider>
  );
};

export const useMyChart = () => {
  const context = useContext(MyChartContext);
  if (!context) {
    throw new Error('useMyChart must be used within a MyChartProvider');
  }
  return context;
};

