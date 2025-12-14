import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type ProcessType = 'enhance' | 'restore' | 'filter' | null;
type FilterType = 'vintage' | 'bw' | 'vivid' | 'soft' | null;

interface ProcessedImage {
  id: string;
  original: string;
  processed: string;
  processType: string;
  timestamp: Date;
  filterType?: string;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processType, setProcessType] = useState<ProcessType>(null);
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [history, setHistory] = useState<ProcessedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl(null);
      setProcessType(null);
      setFilterType(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleProcess = () => {
    if (!previewUrl || !processType) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setProcessedUrl(previewUrl);
      
      const newItem: ProcessedImage = {
        id: Date.now().toString(),
        original: previewUrl,
        processed: previewUrl,
        processType: processType,
        timestamp: new Date(),
        filterType: filterType || undefined
      };
      
      setHistory(prev => [newItem, ...prev]);
      setIsProcessing(false);
    }, 2000);
  };

  const applyFilter = (filter: FilterType) => {
    setFilterType(filter);
    if (processType === 'filter') {
      handleProcess();
    }
  };

  const getProcessLabel = (type: string) => {
    const labels: Record<string, string> = {
      enhance: 'Улучшение',
      restore: 'Восстановление',
      filter: 'Фильтр',
      vintage: 'Винтаж',
      bw: 'Ч/Б',
      vivid: 'Яркий',
      soft: 'Мягкий'
    };
    return labels[type] || type;
  };

  const handleDownload = (imageUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `photo-ai-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Icon name="Sparkles" size={32} className="text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PhotoAI Pro
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Профессиональное улучшение и восстановление фотографий с помощью нейросети
          </p>
        </header>

        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
            <TabsTrigger value="upload" className="gap-2">
              <Icon name="Upload" size={18} />
              Загрузка
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Icon name="ImageIcon" size={18} />
              Галерея
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={18} />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6 animate-fade-in">
            {!previewUrl ? (
              <Card
                className={`p-12 border-2 border-dashed transition-all duration-300 hover-scale cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="Upload" size={40} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Загрузите фото</h3>
                    <p className="text-muted-foreground">
                      Перетащите изображение или нажмите для выбора
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Поддерживаются JPG, PNG, WEBP до 10MB
                    </p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  />
                </div>
              </Card>
            ) : (
              <div className="space-y-6 animate-scale-in">
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Icon name="Sliders" size={20} />
                      Выберите тип обработки
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewUrl(null);
                        setProcessedUrl(null);
                        setSelectedFile(null);
                        setProcessType(null);
                      }}
                    >
                      Сбросить
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      className={`p-6 cursor-pointer transition-all hover-scale ${
                        processType === 'enhance' ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setProcessType('enhance')}
                    >
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Sparkles" size={28} className="text-primary" />
                        </div>
                        <h4 className="font-semibold">Улучшение</h4>
                        <p className="text-sm text-muted-foreground">
                          Повышение четкости и детализации
                        </p>
                      </div>
                    </Card>

                    <Card
                      className={`p-6 cursor-pointer transition-all hover-scale ${
                        processType === 'restore' ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setProcessType('restore')}
                    >
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="ImageIcon" size={28} className="text-primary" />
                        </div>
                        <h4 className="font-semibold">Восстановление</h4>
                        <p className="text-sm text-muted-foreground">
                          Удаление шумов и дефектов
                        </p>
                      </div>
                    </Card>

                    <Card
                      className={`p-6 cursor-pointer transition-all hover-scale ${
                        processType === 'filter' ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setProcessType('filter')}
                    >
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Sliders" size={28} className="text-primary" />
                        </div>
                        <h4 className="font-semibold">Фильтры</h4>
                        <p className="text-sm text-muted-foreground">
                          Художественная обработка
                        </p>
                      </div>
                    </Card>
                  </div>

                  {processType === 'filter' && (
                    <div className="space-y-3 animate-slide-up">
                      <h4 className="text-sm font-medium">Выберите фильтр</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['vintage', 'bw', 'vivid', 'soft'] as FilterType[]).map((filter) => (
                          <Button
                            key={filter}
                            variant={filterType === filter ? 'default' : 'outline'}
                            onClick={() => applyFilter(filter)}
                            className="w-full"
                          >
                            {getProcessLabel(filter!)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full"
                    disabled={!processType || isProcessing}
                    onClick={handleProcess}
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="Sparkles" size={20} className="animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={20} />
                        Обработать фото
                      </>
                    )}
                  </Button>
                </Card>

                {processedUrl ? (
                  <Card className="p-6 space-y-4 animate-scale-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Результат</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Icon name="Sparkles" size={14} />
                        {getProcessLabel(processType!)}
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
                      onClick={() => handleDownload(processedUrl, `photo-ai-${processType}-${Date.now()}.jpg`)}
                    >
                      <Icon name="Download" size={20} />
                      Скачать результат
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Галерея обработанных фото</h3>
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="ImageIcon" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Обработанные изображения появятся здесь</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover-scale cursor-pointer">
                      <div className="aspect-video bg-muted">
                        <img
                          src={item.processed}
                          alt="Processed"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {getProcessLabel(item.processType)}
                          </Badge>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDownload(item.processed, `photo-ai-${item.processType}-${item.id}.jpg`)}
                          >
                            <Icon name="Download" size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">История обработки</h3>
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="History" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История обработки пуста</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card key={item.id} className="p-4 hover-scale cursor-pointer">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={item.processed}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {getProcessLabel(item.processType)}
                            </Badge>
                            {item.filterType && (
                              <Badge variant="outline">
                                {getProcessLabel(item.filterType)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.timestamp.toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDownload(item.processed, `photo-ai-${item.processType}-${item.id}.jpg`)}
                          >
                            <Icon name="Download" size={18} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;