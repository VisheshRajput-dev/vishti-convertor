# Image Converter & Editor

A beautiful, modern web-based image converter and editor that runs entirely in your browser. Convert, compress, resize, rotate, flip, and apply filters to images without uploading to any server - all processing happens client-side for maximum privacy and speed.

## Features

### Image Conversion
- **Format Support**: JPEG, PNG, WebP, AVIF, BMP, GIF, TIFF
- **Compression**: Adjustable quality (1-100%)
- **Batch Processing**: Convert multiple images at once

### Image Editing
- **Resize**: Flexible resizing with multiple modes
  - Fit: Maintain aspect ratio
  - Fill: Stretch to exact dimensions
  - Crop: Center crop to dimensions
- **Rotate**: Rotate images by any angle (-180° to 180°)
- **Flip**: Horizontal, vertical, or both
- **Filters**:
  - Brightness adjustment (-100 to 100)
  - Contrast adjustment (-100 to 100)
  - Saturation adjustment (-100 to 100)
  - Blur (0 to 10px)
  - Grayscale
  - Sepia

### UI/UX Features
- **Drag & Drop**: Intuitive file upload interface
- **Modern Design**: Built with shadcn/ui components
- **Dark Mode**: Automatic theme support with toggle
- **Responsive**: Works on desktop and mobile devices
- **Toast Notifications**: Success/error feedback
- **File Management**: Individual file controls and batch operations
- **Real-time Preview**: See your images before and after processing
- **File Size Comparison**: See compression savings

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Image Processing**: browser-image-compression + Canvas API
- **File Handling**: react-dropzone

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Converting Images

1. Drag and drop image files or click to select
2. Adjust conversion settings:
   - **Basic Tab**: Select output format and quality
   - **Resize Tab**: Set dimensions and resize mode
   - **Edit Tab**: Apply rotation, flip, and filters
3. Click **Convert All** or convert individual files
4. Download converted files

### Image Editing Tips

- **Quality**: Lower values (30-50%) for web use, higher (80-100%) for print
- **Resize Mode**: Use "Fit" to maintain aspect ratio, "Crop" for exact dimensions
- **Filters**: Adjust gradually - small changes often look best
- **Batch Processing**: Apply the same settings to multiple images at once

## File Size Limits

- **Images**: Up to 50MB per file
- **Batch**: Maximum 10 files at once

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)
- Mobile browsers

## Privacy

All file processing happens entirely in your browser. Your files are never uploaded to any server, ensuring complete privacy and security.

## License

MIT
