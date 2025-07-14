import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        poster?: string;
        alt?: string;
        ar?: boolean;
        arModes?: string;
        cameraControls?: boolean;
        autoRotate?: boolean;
        shadowIntensity?: string;
        style?: React.CSSProperties & { '--poster-color'?: string };
      }, HTMLElement>;
    }
  }
}