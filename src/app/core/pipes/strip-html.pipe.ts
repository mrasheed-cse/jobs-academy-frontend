import { Pipe, PipeTransform } from '@angular/core';

/**
 * Strips all HTML tags from a string and returns plain text.
 * Used for news card excerpts where content is stored as rich HTML
 * from the Quill editor but should display as a clean text preview.
 *
 * Usage: {{ item.content | stripHtml | slice:0:150 }}
 */
@Pipe({ name: 'stripHtml', standalone: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    // Use a temporary DOM element to strip tags — handles all edge cases
    // including nested tags, entities, and self-closing elements
    const tmp = document.createElement('div');
    tmp.innerHTML = value;
    return tmp.textContent ?? tmp.innerText ?? '';
  }
}
