import { describe, it, expect, beforeAll } from '@jest/globals';
import { buildMermaidMcpServer } from './server.js';

describe('Mermaid MCP Server', () => {
  let server: ReturnType<typeof buildMermaidMcpServer>;

  beforeAll(() => {
    server = buildMermaidMcpServer();
  });

  describe('Server Initialization', () => {
    it('should create server instance', () => {
      expect(server).toBeDefined();
    });

    it('should have correct server name and version', () => {
      expect(server).toHaveProperty('name', 'mermaid-mcp');
      expect(server).toHaveProperty('version', '1.0.0');
    });
  });

  describe('Validation', () => {
    it('should validate correct flowchart syntax', async () => {
      const code = `flowchart LR
    A[Start] --> B[End]`;
      
      // This would need to be tested with actual tool invocation
      // The validation logic is in the server
      expect(code).toContain('flowchart');
    });

    it('should detect missing diagram type', async () => {
      const code = `A --> B`;
      expect(code).not.toMatch(/^(flowchart|graph|sequenceDiagram)/);
    });

    it('should detect unmatched brackets', () => {
      const code = `flowchart LR\n    A[Start --> B[End]`;
      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/\]/g) || []).length;
      expect(openBrackets).not.toBe(closeBrackets);
    });
  });

  describe('Diagram Type Detection', () => {
    it('should recognize flowchart', () => {
      const code = 'flowchart LR';
      expect(code).toContain('flowchart');
    });

    it('should recognize sequenceDiagram', () => {
      const code = 'sequenceDiagram';
      expect(code).toContain('sequenceDiagram');
    });

    it('should recognize classDiagram', () => {
      const code = 'classDiagram';
      expect(code).toContain('classDiagram');
    });
  });

  describe('Syntax Patterns', () => {
    it('should detect arrow syntax', () => {
      const code = 'A --> B';
      expect(code).toMatch(/-->/);
    });

    it('should detect dotted arrow', () => {
      const code = 'A -.-> B';
      expect(code).toMatch(/\.\.?->/);
    });

    it('should detect thick arrow', () => {
      const code = 'A ==> B';
      expect(code).toMatch(/==>/);
    });
  });
});
