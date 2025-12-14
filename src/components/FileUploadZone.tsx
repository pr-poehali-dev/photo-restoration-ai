import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface FileUploadZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileSelect: (file: File) => void;
}

export const FileUploadZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onFileSelect
}: FileUploadZoneProps) => {
  return (
    <Card
      className={`p-12 border-2 border-dashed transition-all duration-300 hover-scale cursor-pointer ${
        isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
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
          onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        />
      </div>
    </Card>
  );
};
