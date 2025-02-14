import React from 'react';

const SelectDropdown = ({ label, options, selectedOptions, setSelectedOptions }) => {
  const toggleSelection = (id) => {
    setSelectedOptions(selectedOptions.includes(id)
      ? selectedOptions.filter(item => item !== id)
      : [...selectedOptions, id]);
  };

  return (
    <div className="dropdown">
      <label>{label}</label>
      <div className="options">
        {options.map(option => (
          <div key={option.id} className="option"> 
            <input 
              type="checkbox" 
              checked={selectedOptions.includes(option.id)}
              onChange={() => toggleSelection(option.id)}
            />
            <label>{option.first_name} {option.last_name}</label> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectDropdown;
