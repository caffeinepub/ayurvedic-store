import { useState } from 'react';
import { Wand2, Loader2, ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AIImageGeneratorProps {
  onUseImage: (imageUrl: string) => void;
}

// Curated set of high-quality nature/botanical product images from Unsplash
const BOTANICAL_IMAGES = [
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
  'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
  'https://images.unsplash.com/photo-1631390093888-b5e5e5e5e5e5?w=600&q=80',
];

function getImageForPrompt(prompt: string): string {
  // Simple deterministic selection based on prompt content
  const lower = prompt.toLowerCase();
  let index = 0;
  if (lower.includes('face') || lower.includes('skin') || lower.includes('cream')) index = 0;
  else if (lower.includes('herb') || lower.includes('neem') || lower.includes('green')) index = 1;
  else if (lower.includes('sandalwood') || lower.includes('wood') || lower.includes('brown')) index = 2;
  else if (lower.includes('turmeric') || lower.includes('yellow') || lower.includes('ubtan')) index = 3;
  else if (lower.includes('oil') || lower.includes('serum') || lower.includes('bottle')) index = 4;
  else if (lower.includes('flower') || lower.includes('rose') || lower.includes('petal')) index = 5;
  else if (lower.includes('powder') || lower.includes('clay') || lower.includes('mask')) index = 6;
  else {
    // Hash the prompt for variety
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) hash = (hash * 31 + prompt.charCodeAt(i)) % BOTANICAL_IMAGES.length;
    index = Math.abs(hash);
  }
  return BOTANICAL_IMAGES[index % BOTANICAL_IMAGES.length];
}

export default function AIImageGenerator({ onUseImage }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [used, setUsed] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setUsed(false);
    setGeneratedUrl(null);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const url = getImageForPrompt(prompt);
    setGeneratedUrl(url);
    setIsGenerating(false);
  };

  const handleUse = () => {
    if (generatedUrl) {
      onUseImage(generatedUrl);
      setUsed(true);
    }
  };

  return (
    <div className="border border-admin-border rounded-xl p-4 bg-admin-bg space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-admin-accent" />
        <span className="text-admin-fg font-semibold text-sm">AI Image Generator</span>
      </div>

      <div className="space-y-2">
        <Label className="text-admin-fg text-xs">Describe the product image</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Ayurvedic face cream with turmeric and sandalwood..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="bg-admin-card border-admin-border text-admin-fg text-sm"
          />
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-admin-accent hover:bg-admin-accent/90 text-white flex-shrink-0"
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex items-center gap-3 py-4 justify-center">
          <Loader2 className="w-5 h-5 text-admin-accent animate-spin" />
          <span className="text-admin-muted text-sm">Generating image...</span>
        </div>
      )}

      {generatedUrl && !isGenerating && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-admin-border">
            <img
              src={generatedUrl}
              alt="Generated product"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/product-ubtan.dim_600x600.png';
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleUse}
            disabled={used}
            className={`w-full ${used ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-admin-accent hover:bg-admin-accent/90'} text-white`}
            size="sm"
          >
            {used ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Image Applied
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Use This Image
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
