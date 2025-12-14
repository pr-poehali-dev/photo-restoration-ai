import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ComparisonSliderProps {
  previewUrl: string;
  processedUrl: string | null;
  processType: string;
  onDownload: (imageUrl: string, fileName?: string) => void;
  getProcessLabel: (type: string) => string;
}

export const ComparisonSlider = ({
  previewUrl,
  processedUrl,
  processType,
  onDownload,
  getProcessLabel
}: ComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!processedUrl) {
    return (
      <Card className="p-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Результат</h3>
        <Badge variant="secondary" className="gap-1">
          <Icon name="Sparkles" size={14} />
          {getProcessLabel(processType)}
        </Badge>
      </div>

      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${previewUrl})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url(${processedUrl})`,
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={(e) => {
            const onMouseMove = (moveEvent: MouseEvent) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                setSliderPosition(Math.max(0, Math.min(100, percent)));
              }
            };
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Icon name="ChevronsLeftRight" size={16} className="text-primary" />
          </div>
        </div>

        <div className="absolute top-4 left-4">
          <Badge variant="secondary">До</Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="default">После</Badge>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full" 
        variant="outline"
        onClick={() => onDownload(processedUrl, `photo-ai-${processType}-${Date.now()}.jpg`)}
      >
        <Icon name="Download" size={20} />
        Скачать результат
      </Button>
    </Card>
  );
};
