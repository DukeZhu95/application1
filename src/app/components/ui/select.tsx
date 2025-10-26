'use client';

import * as React from 'react';

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({});

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, defaultValue, onValueChange, children }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || value || '');

    const handleValueChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <SelectContext.Provider
        value={{
          value: value || internalValue,
          onValueChange: handleValueChange,
        }}
      >
        <div ref={ref}>{children}</div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, style, ...props }, ref) => {
  const context = React.useContext(SelectContext);

  return (
    <select
      ref={ref}
      value={context.value}
      onChange={(e) => context.onValueChange?.(e.target.value)}
      className={className}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <option value="" disabled>{placeholder}</option>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const SelectItem = ({
                      value,
                      children,
                    }: {
  value: string;
  children: React.ReactNode;
}) => {
  return (
    <option value={value} style={{ background: '#1a1a1a', color: '#fff', padding: '8px' }}>
      {children}
    </option>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };