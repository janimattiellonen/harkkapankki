import { visit } from 'unist-util-visit';
import type { Root, Element, Text, ElementContent } from 'hast';
import { extractYouTubeId, createYouTubeEmbedUrl } from './youtube';

/**
 * Rehype plugin to transform @[youtube](VIDEO_ID_OR_URL) syntax into embedded YouTube iframes
 * The markdown parser converts this into: <p>@<a href="VIDEO_ID_OR_URL">youtube</a></p>
 */
export function rehypeYouTube() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // Look for paragraphs that start with @ followed by a link with text "youtube"
      if (
        node.tagName === 'p' &&
        node.children &&
        node.children.length >= 2 &&
        node.children[0].type === 'text' &&
        (node.children[0] as Text).value === '@' &&
        node.children[1].type === 'element' &&
        (node.children[1] as Element).tagName === 'a'
      ) {
        const linkElement = node.children[1] as Element;
        const linkText = linkElement.children[0];

        // Check if link text is "youtube"
        if (
          linkText &&
          linkText.type === 'text' &&
          (linkText as Text).value === 'youtube' &&
          linkElement.properties &&
          typeof linkElement.properties.href === 'string'
        ) {
          const videoInput = linkElement.properties.href;
          const videoId = extractYouTubeId(videoInput);

          if (videoId && parent && typeof index === 'number') {
            // Replace the entire paragraph with the iframe
            const iframeElement: Element = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['youtube-embed-container'],
                style:
                  'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;',
              },
              children: [
                {
                  type: 'element',
                  tagName: 'iframe',
                  properties: {
                    src: createYouTubeEmbedUrl(videoId),
                    title: 'YouTube video player',
                    frameBorder: '0',
                    allow:
                      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    allowFullScreen: true,
                    style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
                  },
                  children: [],
                },
              ],
            };

            // Replace the paragraph with the iframe
            (parent.children as ElementContent[])[index] = iframeElement;
          }
        }
      }
    });
  };
}
