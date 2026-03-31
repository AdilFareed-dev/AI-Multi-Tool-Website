import React, { useState, FormEvent } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ToolContainer } from '../common/ToolContainer';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

const RecipeGenerator = ({ onBack }: { onBack: () => void }) => {
  const [ingredients, setIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `List a few popular cookie recipes using these ingredients: ${ingredients}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    recipeName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["recipeName", "description", "ingredients", "instructions"],
                }
              }
            }
          },
        },
      });

      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr);
      setRecipes(parsed.recipes || []);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate recipes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolContainer title="Recipe Generator" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., flour, sugar, chocolate chips"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !ingredients.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Find Recipes'}
          </button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        <div className="flex-grow overflow-y-auto space-y-6 mt-4">
            {isLoading && <div className="flex justify-center"><LoadingSpinner/></div>}
            {recipes.length > 0 && recipes.map((recipe, index) => (
              <div key={index} className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-purple-300">{recipe.recipeName}</h3>
                <p className="text-gray-400 mt-1 mb-4">{recipe.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Ingredients</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Instructions</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </ToolContainer>
  );
};

export default RecipeGenerator;
