import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProcessedImage {
  id: string;
  original: string;
  processed: string;
  processType: string;
  timestamp: Date;
  filterType?: string;
}

interface HistoryGalleryProps {
  history: ProcessedImage[];
  onDownload: (imageUrl: string, fileName?: string) => void;
  getProcessLabel: (type: string) => string;
}

export const HistoryGallery = ({
  history,
  onDownload,
  getProcessLabel
}: HistoryGalleryProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Icon name="History" size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">История пуста</h3>
        <p className="text-muted-foreground">
          Обработанные фотографии будут отображаться здесь
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {history.map((item) => (
        <Card key={item.id} className="overflow-hidden group hover-scale">
          <div className="relative aspect-video bg-muted">
            <img
              src={item.processed}
              alt="Processed"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="gap-1">
                <Icon name="Sparkles" size={12} />
                {getProcessLabel(item.processType)}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{item.timestamp.toLocaleDateString('ru-RU')}</span>
              <span>{item.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onDownload(item.processed, `photo-ai-${item.processType}-${item.id}.jpg`)}
            >
              <Icon name="Download" size={16} />
              Скачать
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
