import { Form } from "react-router";
import type { Category } from "~/models/game.server";

interface CommitmentFormProps {
  categories: Category[];
  playerName: string;
}

const categoryToLabelMap: { [key: string]: string } = {
  'Eating': 'Donuts',
  'Drinking': 'Øl',
  'Running': 'Løping',
  'Fapping': 'Runk'
};

export default function CommitmentForm({ categories }: CommitmentFormProps) {
  return (
    <div className="p-4">
      <p className="mb-8">Du må sette målene dine for hver kategori.</p>
      <Form method="post" className="max-w-lg">
        <input type="hidden" name="_action" value="createCommitments" />
        <div className="space-y-4 grid grid-cols-2 gap-2">
          {categories.map(category => (
            <div key={category.id}>
              <label htmlFor={`category-${category.id}`} className="block text-sm font-medium text-brand-text">
                {categoryToLabelMap[category.name] || category.name} ({category.unit})
              </label>
              <input
                type="number"
                id={`category-${category.id}`}
                name={category.name}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter target amount"
                required
              />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Commitments
          </button>
        </div>
      </Form>
    </div>
  );
}
