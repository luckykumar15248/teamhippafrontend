declare module '@editorjs/embed' {
  import { BlockTool, BlockToolData, API } from '@editorjs/editorjs';
  
  export interface EmbedData extends BlockToolData {
    service?: string;
    source?: string;
    embed?: string;
    width?: number;
    height?: number;
    caption?: string;
  }

  interface EmbedConfig {
    services?: {
      [key: string]: {
        regex: RegExp;
        embedUrl: string;
        html: string;
        height?: number;
        width?: number;
        id?: (ids: string[]) => string;
      };
    };
  }

  export default class Embed implements BlockTool {
    constructor(config?: { 
      data?: EmbedData;
      readOnly?: boolean;
      api?: API;
      config?: EmbedConfig;
    });
    
    render(): HTMLElement;
    save(block: HTMLElement): EmbedData;
    static get toolbox(): {
      icon: string;
      title: string;
    };
    static get isReadOnlySupported(): boolean;
    
    // Optional methods
    validate?(savedData: EmbedData): boolean;
    renderSettings?(): HTMLElement;
  }
}