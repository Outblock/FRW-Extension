declare module 'csstype' {
  interface Properties {
    '--background'?: string;
    [index: string]: any;
  }
}

declare module '*.md';

declare module '*.svg' {
  import React = require('react');
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module 'browser-passworder' {
  export function encrypt(password: string, privateKey: any): Promise<string>;
  export function decrypt(password: string, encrypted: string): Promise<Buffer>;
}
