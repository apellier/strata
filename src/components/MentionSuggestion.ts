import { ReactRenderer } from '@tiptap/react';
import MentionSuggestions, { MentionSuggestionsRef } from './MentionSuggestions';
import type { MentionEntity } from '@/app/api/search/mentions/route';

let searchTimeout: NodeJS.Timeout | null = null;

export const suggestion = {
  items: async ({ query }: { query: string }): Promise<MentionEntity[]> => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Don't show dropdown for very short queries
    if (query.length < 1) {
      return [];
    }

    try {
      const response = await fetch(`/api/search/mentions?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const results = await response.json();
      
      // Always return an array, even if empty, so the suggestion dropdown appears
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error fetching mention suggestions:', error);
      // Return empty array so "No results found" can be shown
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer<MentionSuggestionsRef>;
    let popup: HTMLDivElement;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionSuggestions, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        // Create floating element using standard DOM approach
        popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.zIndex = '9999';
        popup.style.pointerEvents = 'auto';
        popup.style.maxHeight = '300px';
        popup.style.overflowY = 'auto';
        popup.appendChild(component.element);
        document.body.appendChild(popup);

        // Initial positioning
        if (props.clientRect) {
          const rect = props.clientRect();
          popup.style.top = `${rect.bottom + 8}px`;
          popup.style.left = `${rect.left}px`;
        }
      },

      onUpdate(props: any) {
        if (component) {
          component.updateProps(props);
        }

        // Only update position if the popup doesn't exist or if the client rect changes significantly
        if (!props.clientRect || !popup) {
          return;
        }

        // Get current position
        const rect = props.clientRect();
        const currentTop = parseFloat(popup.style.top.replace('px', ''));
        const expectedTop = rect.bottom + 8;
        
        // Only reposition if there's a significant change (more than 5px difference)
        if (Math.abs(currentTop - expectedTop) > 5) {
          let top = rect.bottom + 8;
          let left = rect.left;
          
          // Basic overflow prevention
          const popupRect = popup.getBoundingClientRect();
          if (left + popupRect.width > window.innerWidth) {
            left = Math.max(16, window.innerWidth - popupRect.width - 16);
          }
          
          if (top + popupRect.height > window.innerHeight) {
            top = Math.max(16, rect.top - popupRect.height - 8);
          }
          
          popup.style.top = `${top}px`;
          popup.style.left = `${left}px`;
        }
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
          return true;
        }

        return component?.ref?.onKeyDown(props.event) || false;
      },

      onExit() {
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
        if (component) {
          component.destroy();
        }
      },
    };
  },

  // Debounce the search to avoid too many API calls
  char: '@',
  allowSpaces: true,
  startOfLine: false,
  
  // Custom mention node rendering
  renderHTML({ options, node }: { options: any; node: any }) {
    const { id, label, type, data } = node.attrs;
    
    return [
      'span',
      {
        'data-type': type,
        'data-id': id,
        'data-mention-type': type,
        'data-label': label,
        class: `mention`,
      },
      `@${label}`,
    ];
  },
};