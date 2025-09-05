import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalaryChart = ({ data }) => {
  const chartData = data.map(item => ({
    month: item.monthYear,
    salary: item.netSalary
  }));

  // Custom tooltip formatter for Indian rupees
  const formatTooltip = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Custom tick formatter for Y-axis
  const formatYAxis = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`; // Convert to lakhs
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`; // Convert to thousands
    }
    return `₹${value}`;
  };

  return (
    <div style={{ height: '300px' }}>
      <h5>Monthly Salary (Last 6 Months)</h5>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value) => [formatTooltip(value), 'Salary']} />
          <Legend />
          <Bar dataKey="salary" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryChart;