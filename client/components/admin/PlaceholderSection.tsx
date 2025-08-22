import { Button } from "@/components/ui/button";

interface PlaceholderSectionProps {
  title: string;
}

export function PlaceholderSection({ title }: PlaceholderSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">Coming in next phase</p>
      <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
        Save
      </Button>
    </div>
  );
}
