import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { FileUploadZone } from '@/components/FileUploadZone';
import { ProcessingControls } from '@/components/ProcessingControls';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { HistoryGallery } from '@/components/HistoryGallery';

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
  const [history, setHistory] = useState<ProcessedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleProcess = async () => {
    if (!previewUrl || !processType || !selectedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const response = await fetch('https://functions.poehali.dev/60b84525-0d8c-4d60-a5aa-a63e14737969', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64String,
            processType: processType,
            filterType: filterType
          })
        });
        
        if (!response.ok) {
          throw new Error('Processing failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.processedImage) {
          const processedImageUrl = `data:image/jpeg;base64,${data.processedImage}`;
          setProcessedUrl(processedImageUrl);
          
          const newItem: ProcessedImage = {
            id: Date.now().toString(),
            original: previewUrl,
            processed: processedImageUrl,
            processType: processType,
            timestamp: new Date(),
            filterType: filterType || undefined
          };
          
          setHistory(prev => [newItem, ...prev]);
        } else {
          throw new Error(data.error || 'Processing failed');
        }
        
        clearInterval(progressInterval);
        setProgress(100);
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        clearInterval(progressInterval);
        setProgress(0);
        setIsProcessing(false);
        alert('Ошибка чтения файла');
      };
    } catch (error) {
      setProgress(0);
      setIsProcessing(false);
      alert(`Ошибка обработки: ${error}`);
    }
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

  const handleReset = () => {
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProcessType(null);
    setFilterType(null);
    setSelectedFile(null);
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
              <FileUploadZone
                isDragging={isDragging}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                onFileSelect={handleFileSelect}
              />
            ) : (
              <div className="space-y-6 animate-scale-in">
                <ProcessingControls
                  processType={processType}
                  filterType={filterType}
                  isProcessing={isProcessing}
                  progress={progress}
                  onProcessTypeChange={setProcessType}
                  onFilterChange={applyFilter}
                  onProcess={handleProcess}
                  onReset={handleReset}
                  getProcessLabel={getProcessLabel}
                />

                <ComparisonSlider
                  previewUrl={previewUrl}
                  processedUrl={processedUrl}
                  processType={processType || ''}
                  onDownload={handleDownload}
                  getProcessLabel={getProcessLabel}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="animate-fade-in">
            <div className="text-center p-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="ImageIcon" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Галерея скоро появится</h3>
              <p className="text-muted-foreground">
                Здесь будут отображаться примеры обработанных фотографий
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <HistoryGallery
              history={history}
              onDownload={handleDownload}
              getProcessLabel={getProcessLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
