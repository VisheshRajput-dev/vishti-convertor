import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ImageConversionOptions } from '@/types/converter';

interface ImageSettingsProps {
  options: ImageConversionOptions;
  onChange: (options: ImageConversionOptions) => void;
}

export function ImageConversionSettings({ options, onChange }: ImageSettingsProps) {
  return (
    <Card className="p-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="resize">Resize</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.format}
              onValueChange={(value) => onChange({ ...options, format: value as ImageConversionOptions['format'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="avif">AVIF</SelectItem>
                <SelectItem value="bmp">BMP</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="tiff">TIFF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target File Size */}
          <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Target File Size</Label>
              <Switch
                checked={options.targetFileSize?.enabled || false}
                onCheckedChange={(checked) => onChange({
                  ...options,
                  targetFileSize: {
                    enabled: checked,
                    size: options.targetFileSize?.size || 1,
                    unit: options.targetFileSize?.unit || 'MB',
                  },
                })}
              />
            </div>
            
            {options.targetFileSize?.enabled && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={options.targetFileSize.size || 1}
                    onChange={(e) => onChange({
                      ...options,
                      targetFileSize: {
                        enabled: true,
                        size: Number(e.target.value) || 1,
                        unit: options.targetFileSize?.unit || 'MB',
                      },
                    })}
                    min={0.1}
                    max={50}
                    step={0.1}
                    className="flex-1"
                    placeholder="1"
                  />
                  <Select
                    value={options.targetFileSize.unit || 'MB'}
                    onValueChange={(value) => onChange({
                      ...options,
                      targetFileSize: {
                        enabled: true,
                        size: options.targetFileSize?.size || 1,
                        unit: value as 'KB' | 'MB',
                      },
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Image will be compressed to approximately {options.targetFileSize.size} {options.targetFileSize.unit}
                </p>
              </div>
            )}
          </div>

          {/* Quality (disabled if target size is enabled) */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className={options.targetFileSize?.enabled ? 'text-muted-foreground' : ''}>
                Quality
                {options.targetFileSize?.enabled && (
                  <span className="ml-2 text-xs">(Auto-adjusted for target size)</span>
                )}
              </Label>
              <span className="text-sm text-muted-foreground">{options.quality}%</span>
            </div>
            <Slider
              value={[options.quality]}
              onValueChange={([value]) => onChange({ ...options, quality: value })}
              min={1}
              max={100}
              step={1}
              disabled={options.targetFileSize?.enabled}
            />
            {options.targetFileSize?.enabled && (
              <p className="text-xs text-muted-foreground">
                Quality is automatically adjusted to meet target file size
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resize" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Resize Image</Label>
            <Switch
              checked={!!(options.maxWidth || options.maxHeight)}
              onCheckedChange={(checked) => {
                if (!checked) {
                  onChange({ ...options, maxWidth: undefined, maxHeight: undefined });
                } else {
                  onChange({ ...options, maxWidth: 1920, maxHeight: 1080 });
                }
              }}
            />
          </div>
          
          {(options.maxWidth || options.maxHeight) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Width (px)</Label>
                  <Input
                    type="number"
                    value={options.maxWidth || ''}
                    onChange={(e) => onChange({ ...options, maxWidth: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="1920"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Height (px)</Label>
                  <Input
                    type="number"
                    value={options.maxHeight || ''}
                    onChange={(e) => onChange({ ...options, maxHeight: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="1080"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resize Mode</Label>
                <Select
                  value={options.resizeMode || 'fit'}
                  onValueChange={(value) => onChange({ ...options, resizeMode: value as 'fit' | 'fill' | 'crop' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit (Maintain Aspect)</SelectItem>
                    <SelectItem value="fill">Fill (Stretch)</SelectItem>
                    <SelectItem value="crop">Crop (Center)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={options.maintainAspectRatio}
                  onCheckedChange={(checked) => onChange({ ...options, maintainAspectRatio: checked })}
                />
                <Label>Maintain Aspect Ratio</Label>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {/* Rotate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Rotate</Label>
              <span className="text-sm text-muted-foreground">{options.rotate || 0}°</span>
            </div>
            <Slider
              value={[options.rotate || 0]}
              onValueChange={([value]) => onChange({ ...options, rotate: value })}
              min={-180}
              max={180}
              step={90}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...options, rotate: (options.rotate || 0) - 90 })}
                className="text-xs px-2 py-1 border rounded"
              >
                -90°
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...options, rotate: 0 })}
                className="text-xs px-2 py-1 border rounded"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...options, rotate: (options.rotate || 0) + 90 })}
                className="text-xs px-2 py-1 border rounded"
              >
                +90°
              </button>
            </div>
          </div>

          {/* Flip */}
          <div className="space-y-2">
            <Label>Flip</Label>
            <Select
              value={options.flip || 'none'}
              onValueChange={(value) => onChange({ ...options, flip: value as ImageConversionOptions['flip'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-sm font-semibold">Filters</Label>
            
            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Brightness</Label>
                <span className="text-xs text-muted-foreground">{options.filters?.brightness || 0}</span>
              </div>
              <Slider
                value={[options.filters?.brightness || 0]}
                onValueChange={([value]) => onChange({
                  ...options,
                  filters: { ...options.filters, brightness: value },
                })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Contrast</Label>
                <span className="text-xs text-muted-foreground">{options.filters?.contrast || 0}</span>
              </div>
              <Slider
                value={[options.filters?.contrast || 0]}
                onValueChange={([value]) => onChange({
                  ...options,
                  filters: { ...options.filters, contrast: value },
                })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Saturation</Label>
                <span className="text-xs text-muted-foreground">{options.filters?.saturation || 0}</span>
              </div>
              <Slider
                value={[options.filters?.saturation || 0]}
                onValueChange={([value]) => onChange({
                  ...options,
                  filters: { ...options.filters, saturation: value },
                })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            {/* Blur */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Blur</Label>
                <span className="text-xs text-muted-foreground">{options.filters?.blur || 0}px</span>
              </div>
              <Slider
                value={[options.filters?.blur || 0]}
                onValueChange={([value]) => onChange({
                  ...options,
                  filters: { ...options.filters, blur: value },
                })}
                min={0}
                max={10}
                step={0.5}
              />
            </div>

            {/* Grayscale & Sepia */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={options.filters?.grayscale || false}
                  onCheckedChange={(checked) => onChange({
                    ...options,
                    filters: { ...options.filters, grayscale: checked },
                  })}
                />
                <Label className="text-xs">Grayscale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={options.filters?.sepia || false}
                  onCheckedChange={(checked) => onChange({
                    ...options,
                    filters: { ...options.filters, sepia: checked },
                  })}
                />
                <Label className="text-xs">Sepia</Label>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={() => onChange({ ...options, filters: {} })}
              className="w-full text-xs px-2 py-1 border rounded text-muted-foreground hover:text-foreground"
            >
              Reset All Filters
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
