import Link from "next/link";
import { Ingredient } from "@/lib/types";
import { Check } from "lucide-react";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {ingredients.map((ing, i) => (
        <li key={i} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-tea-500 shrink-0" />
          <Link
            href={`/ingredients/${ing.slug || ing.name}`}
            className="text-sm text-foreground/80 hover:text-tea-600 dark:hover:text-tea-400 transition-colors underline-offset-2 hover:underline"
          >
            <span className="font-medium">{ing.name}</span>
            {ing.amount && (
              <span className="text-foreground/50 ml-1">{ing.amount}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
