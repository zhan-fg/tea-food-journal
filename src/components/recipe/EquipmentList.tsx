import Link from "next/link";
import { Wrench } from "lucide-react";

interface EquipmentListProps {
  equipment: string[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  if (!equipment || equipment.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {equipment.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-tea-500 shrink-0" />
          <Link
            href={`/equipment/${item}`}
            className="text-sm text-foreground/80 hover:text-tea-600 dark:hover:text-tea-400 transition-colors underline-offset-2 hover:underline"
          >
            {item}
          </Link>
        </li>
      ))}
    </ul>
  );
}
