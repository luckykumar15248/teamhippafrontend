declare module '@editorjs/link' {
  import { BlockTool, BlockToolData, API } from '@editorjs/editorjs';
  
  export interface LinkData extends BlockToolData {
    link?: string;
    meta?: {
      title?: string;
      site_name?: string;
      description?: string;
      image?: {
        url?: string;
      };
    };
  }

  interface LinkConfig {
    endpoint?: string;
    headers?: Record<string, string>;
  }

  export default class LinkTool implements BlockTool {
    constructor(config?: { 
      data?: LinkData;
      readOnly?: boolean;
      api?: API;
      config?: LinkConfig;
    });
    
    render(): HTMLElement;
    save(block: HTMLElement): LinkData;
    static get toolbox(): {
      icon: string;
      title: string;
    };
    static get isReadOnlySupported(): boolean;
    
    // Optional methods
    validate?(savedData: LinkData): boolean;
    renderSettings?(): HTMLElement;
  }
}