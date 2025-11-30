import { ImageConverter } from '@/components/ImageConverter';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/logo.png';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Image Converter Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">Image Converter & Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Convert, compress, resize, and edit images in your browser
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ImageConverter />
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Image Converter Logo" 
                className="h-6 w-6 object-contain opacity-70"
              />
              <p className="text-sm font-medium">Image Converter & Editor</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              All processing happens in your browser. Your files never leave your device.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
