import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  ix: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  ix,
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cms-collapse" data-open={open}>
      <button
        type="button"
        className="cms-collapse-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="ix">{ix}</span>
        <span className="t">{title}</span>
        <ChevronDown className="chev" size={14} strokeWidth={1.6} />
      </button>
      {open && <div className="cms-collapse-body">{children}</div>}
    </div>
  );
}
