declare module '@editorjs/checklist' {
  import { BlockTool, BlockToolData, API } from '@editorjs/editorjs';
  
  export interface ChecklistItem {
    text: string;
    checked: boolean;
  }

  export interface ChecklistData extends BlockToolData {
    items?: ChecklistItem[];
  }

  interface ChecklistConfig {
    data?: ChecklistData;
    readOnly?: boolean;
    api?: API;
    config?: {
      defaultStyle?: 'unordered' | 'ordered';
    };
  }

  export default class Checklist implements BlockTool {
    constructor(config?: ChecklistConfig);
    
    render(): HTMLElement;
    save(block: HTMLElement): ChecklistData;
    static get toolbox(): {
      icon: string;
      title: string;
    };
    static get isReadOnlySupported(): boolean;
    
    // Optional methods
    validate?(savedData: ChecklistData): boolean;
    merge?(data: ChecklistData): void;
    renderSettings?(): HTMLElement;
  }
}