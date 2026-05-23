import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="checkbox-row">
      <span
        className="cbx"
        data-on={checked}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        <Check strokeWidth={3} />
      </span>
      {label}
    </label>
  );
}
