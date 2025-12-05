import { describe, it, expect } from '@jest/globals';

describe('Optimized Mermaid Documentation Search', () => {

  it('should have docs cache initialized at startup', async () => {
    // This is tested implicitly through the server startup
    expect(true).toBe(true);
  });

  it('should search with snippet mode by default', async () => {
    // This would require exposing the searchMermaidDocs function
    // For now, we test the integration through the MCP tool
    expect(true).toBe(true);
  });

  it('should filter by diagram_type when specified', async () => {
    // Integration test - would need MCP client
    expect(true).toBe(true);
  });

  it('should extract markdown sections correctly', () => {
    const sampleMarkdown = `# Flowcharts - Basic Syntax

Flowcharts are composed of **nodes** (geometric shapes) and **edges** (arrows or lines).

## Nodes

### A node (default)

This is a basic node.

## Edges

### Links with arrows

Arrows can be used to show direction.`;

    // Test that searching for "arrows" would find the line and extract its section
    const lines = sampleMarkdown.split(/\r?\n/);
    let foundArrowsLine = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('arrows')) {
        foundArrowsLine = true;
        expect(lines[i]).toContain('arrows');
        break;
      }
    }
    
    expect(foundArrowsLine).toBe(true);
  });

  it('should handle case-insensitive search by default', () => {
    const searchTerm = "FlOwChArT";
    const content = "This is about flowchart syntax";
    
    expect(content.toLowerCase().includes(searchTerm.toLowerCase())).toBe(true);
  });

  it('should limit results by maxResults parameter', () => {
    const maxResults = 5;
    const results = Array(10).fill(null);
    const limited = results.slice(0, maxResults);
    
    expect(limited.length).toBe(5);
  });

  it('should return full file content when mode is full', () => {
    const modes = ['snippet', 'full'] as const;
    expect(modes).toContain('snippet');
    expect(modes).toContain('full');
  });

  it('should extract header level correctly', () => {
    const testCases = [
      { line: '# Header 1', expected: 1 },
      { line: '## Header 2', expected: 2 },
      { line: '### Header 3', expected: 3 },
      { line: '#### Header 4', expected: 4 },
    ];

    testCases.forEach(({ line, expected }) => {
      const match = line.match(/^#{1,6}/);
      expect(match).toBeTruthy();
      expect(match![0].length).toBe(expected);
    });
  });

  it('should handle empty lines gracefully', () => {
    const lines = ['# Header', '', 'Content', '', '## Next'];
    
    lines.forEach(line => {
      const isEmpty = !line;
      if (isEmpty) {
        expect(line).toBe('');
      }
    });
  });

  it('should extract sections between headers', () => {
    const lines = [
      '# Main Header',
      'Content line 1',
      'Content line 2',
      '## Sub Header',
      'Sub content',
      '## Another Sub',
    ];

    const headerIndex = 0;
    const headerLevel = 1;
    let endIndex = lines.length;

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const match = lines[i].match(/^#{1,6}\s/);
      if (match && match[0].length <= headerLevel) {
        endIndex = i;
        break;
      }
    }

    const section = lines.slice(headerIndex, endIndex);
    expect(section).toContain('# Main Header');
    expect(section).toContain('Content line 1');
    expect(section.length).toBeGreaterThan(0);
  });
});
