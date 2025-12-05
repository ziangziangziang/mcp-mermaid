import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Mermaid Documentation Search', () => {
  const mermaidDocsDir = path.join(__dirname, '..', 'mermaid', 'docs', 'syntax');

  it('should have mermaid documentation directory', () => {
    expect(fs.existsSync(mermaidDocsDir)).toBe(true);
  });

  it('should have flowchart documentation', () => {
    const flowchartDoc = path.join(mermaidDocsDir, 'flowchart.md');
    expect(fs.existsSync(flowchartDoc)).toBe(true);
  });

  it('should have sequence diagram documentation', () => {
    const sequenceDoc = path.join(mermaidDocsDir, 'sequenceDiagram.md');
    expect(fs.existsSync(sequenceDoc)).toBe(true);
  });

  it('should have class diagram documentation', () => {
    const classDoc = path.join(mermaidDocsDir, 'classDiagram.md');
    expect(fs.existsSync(classDoc)).toBe(true);
  });

  it('should be able to search for arrow syntax in flowchart docs', () => {
    const flowchartDoc = path.join(mermaidDocsDir, 'flowchart.md');
    const content = fs.readFileSync(flowchartDoc, 'utf-8');
    
    expect(content.toLowerCase()).toContain('arrow');
  });

  it('should be able to search for participant in sequence docs', () => {
    const sequenceDoc = path.join(mermaidDocsDir, 'sequenceDiagram.md');
    const content = fs.readFileSync(sequenceDoc, 'utf-8');
    
    expect(content.toLowerCase()).toContain('participant');
  });

  it('should be able to find context lines around matches', () => {
    const flowchartDoc = path.join(mermaidDocsDir, 'flowchart.md');
    const content = fs.readFileSync(flowchartDoc, 'utf-8');
    const lines = content.split(/\r?\n/);
    
    // Find a line containing 'arrow'
    const matchIndex = lines.findIndex(line => line.toLowerCase().includes('arrow'));
    expect(matchIndex).toBeGreaterThan(-1);
    
    // Verify we can get context lines
    if (matchIndex > 0) {
      expect(lines[matchIndex - 1]).toBeDefined();
    }
    if (matchIndex < lines.length - 1) {
      expect(lines[matchIndex + 1]).toBeDefined();
    }
  });

  it('should have multiple documentation files', () => {
    const files = fs.readdirSync(mermaidDocsDir).filter(f => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(10);
  });
});
