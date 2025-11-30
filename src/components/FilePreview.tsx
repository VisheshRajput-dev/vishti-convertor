import { X, Download, Video, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FileMetadata, ConvertedFile, ConversionProgress } from '@/types/converter';
import { formatFileSize } from '@/lib/fileUtils';

interface FilePreviewProps {
  file: FileMetadata;
  converted?: ConvertedFile;
  progress?: ConversionProgress;
  onRemove: () => void;
  onDownload?: () => void;
  isImage?: boolean;
}

export function FilePreview({
  file,
  converted,
  progress,
  onRemove,
  onDownload,
  isImage = false,
}: FilePreviewProps) {
  const isProcessing = progress?.status === 'processing';
  const isCompleted = progress?.status === 'completed';
  const hasError = progress?.status === 'error';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* File Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Large Preview Section */}
        {isImage && file.preview && (
          <div className="space-y-3">
            {/* Comparison View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Original</Label>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
                <div className="relative bg-muted rounded-lg p-3 border-2 border-dashed border-muted-foreground/20">
                  <img
                    src={file.preview}
                    alt="Original"
                    className="w-full h-auto max-h-[300px] object-contain rounded"
                  />
                </div>
              </div>

              {/* Preview with Changes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    {file.processedPreview && file.processedPreview !== file.preview && (
                      <Badge className="text-xs bg-primary">Live</Badge>
                    )}
                  </div>
                  {file.processedPreview && file.processedPreview !== file.preview && (
                    <Badge variant="secondary" className="text-xs">
                      Changes Applied
                    </Badge>
                  )}
                </div>
                <div className="relative bg-muted rounded-lg p-3 border-2 border-primary/30">
                  <img
                    src={file.processedPreview || file.preview}
                    alt="Preview"
                    className="w-full h-auto max-h-[300px] object-contain rounded"
                  />
                  {!file.processedPreview || file.processedPreview === file.preview ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">No changes applied</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Full Screen View Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Screen Comparison
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{file.name}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comparison">Side by Side</TabsTrigger>
                    <TabsTrigger value="preview">Preview Only</TabsTrigger>
                    {converted && (
                      <TabsTrigger value="converted">Converted</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="comparison" className="mt-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Original</h3>
                        <div className="bg-muted rounded-lg p-4 border-2 border-dashed">
                          <img
                            src={file.preview}
                            alt="Original"
                            className="w-full h-auto max-h-[70vh] object-contain rounded"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">Preview (With Changes)</h3>
                          <Badge className="text-xs">Live</Badge>
                        </div>
                        <div className="bg-muted rounded-lg p-4 border-2 border-primary">
                          <img
                            src={file.processedPreview || file.preview}
                            alt="Preview"
                            className="w-full h-auto max-h-[70vh] object-contain rounded"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Preview of final result
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="flex justify-center bg-muted rounded-lg p-6 border-2 border-primary">
                      <img
                        src={file.processedPreview || file.preview}
                        alt="Preview"
                        className="max-w-full max-h-[75vh] object-contain rounded shadow-lg"
                      />
                    </div>
                  </TabsContent>
                  
                  {converted && (
                    <TabsContent value="converted" className="mt-4">
                      <div className="flex justify-center bg-muted rounded-lg p-6 border-2 border-green-500/30">
                        <img
                          src={converted.downloadUrl}
                          alt="Converted"
                          className="max-w-full max-h-[75vh] object-contain rounded shadow-lg"
                        />
                      </div>
                      <div className="mt-4 flex justify-center gap-4 text-sm">
                        <Badge variant="outline">
                          Original: {formatFileSize(converted.originalSize)}
                        </Badge>
                        <Badge variant="outline">
                          Converted: {formatFileSize(converted.convertedSize)}
                        </Badge>
                        <Badge variant="secondary">
                          {((1 - converted.convertedSize / converted.originalSize) * 100).toFixed(1)}% smaller
                        </Badge>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Non-image placeholder */}
        {!isImage && (
          <div className="w-full h-48 rounded-lg border flex items-center justify-center bg-muted">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Progress & Status */}
        <div className="space-y-3">
          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Converting...</span>
                <span className="text-muted-foreground">{Math.round(progress?.progress || 0)}%</span>
              </div>
              <Progress value={progress?.progress || 0} className="h-2" />
            </div>
          )}

          {/* Error */}
          {hasError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">Conversion Failed</p>
              <p className="text-xs text-destructive/80 mt-1">
                {progress?.error || 'Unknown error occurred'}
              </p>
            </div>
          )}

          {/* Conversion Result */}
          {isCompleted && converted && (
            <div className="space-y-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Conversion Complete!
                </p>
                <Badge variant="outline" className="bg-background">
                  {converted.format.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Original</p>
                  <p className="font-medium">{formatFileSize(converted.originalSize)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Converted</p>
                  <p className="font-medium">{formatFileSize(converted.convertedSize)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Saved</p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {((1 - converted.convertedSize / converted.originalSize) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              {onDownload && (
                <Button onClick={onDownload} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download {converted.format.toUpperCase()} File
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

