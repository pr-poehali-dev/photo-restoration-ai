import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type ProcessType = 'enhance' | 'restore' | 'filter' | null;
type FilterType = 'vintage' | 'bw' | 'vivid' | 'soft' | null;

interface ProcessingControlsProps {
  processType: ProcessType;
  filterType: FilterType;
  isProcessing: boolean;
  progress: number;
  onProcessTypeChange: (type: ProcessType) => void;
  onFilterChange: (filter: FilterType) => void;
  onProcess: () => void;
  onReset: () => void;
  getProcessLabel: (type: string) => string;
}

export const ProcessingControls = ({
  processType,
  filterType,
  isProcessing,
  progress,
  onProcessTypeChange,
  onFilterChange,
  onProcess,
  onReset,
  getProcessLabel
}: ProcessingControlsProps) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Sliders" size={20} />
          Выберите тип обработки
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
        >
          <Icon name="X" size={18} />
          Сбросить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all hover-scale ${
            processType === 'enhance' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => onProcessTypeChange('enhance')}
        >
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Sparkles" size={28} className="text-primary" />
            </div>
            <h4 className="font-semibold">Улучшение</h4>
            <p className="text-sm text-muted-foreground">
              Повышение качества и четкости
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all hover-scale ${
            processType === 'restore' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => onProcessTypeChange('restore')}
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
          onClick={() => onProcessTypeChange('filter')}
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
                onClick={() => onFilterChange(filter)}
                className="w-full"
              >
                {getProcessLabel(filter!)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Обработка нейросетью...</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!processType || isProcessing}
        onClick={onProcess}
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
  );
};
