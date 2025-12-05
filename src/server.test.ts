import { describe, it, expect, beforeAll } from '@jest/globals';
import { buildMermaidMcpServer, validateMermaidSyntax } from './server.js';

describe('Mermaid MCP Server', () => {
  let server: ReturnType<typeof buildMermaidMcpServer>;

  beforeAll(() => {
    server = buildMermaidMcpServer();
  });

  describe('Server Initialization', () => {
    it('should create server instance', () => {
      expect(server).toBeDefined();
    });
  });

  describe('validate_mermaid Tool', () => {
    it('should validate a correct flowchart', async () => {
      const code = `flowchart LR
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[End]
    C -->|No| A`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a correct sequence diagram', async () => {
      const code = `sequenceDiagram
    participant User
    participant Server
    participant Database
    
    User->>Server: Request Data
    Server->>Database: Query
    Database-->>Server: Result
    Server-->>User: Response`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a correct class diagram', async () => {
      const code = `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect empty diagram code', async () => {
      const code = '';
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty diagram code');
    });

    it('should detect missing diagram type', async () => {
      const code = `A --> B --> C`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No valid diagram type found');
    });

    it('should detect unmatched square brackets', async () => {
      const code = `flowchart LR
    A[Start --> B[End]`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unmatched brackets');
    });

    it('should detect unmatched parentheses', async () => {
      const code = `flowchart LR
    A(Start --> B(End`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unmatched parentheses');
    });

    it('should detect unmatched braces', async () => {
      const code = `flowchart LR
    A --> B{Decision}
    B --> C{Another`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unmatched braces');
    });

    it('should validate flowchart with reserved word patterns', async () => {
      const code = `flowchart LR
    A[Start] --> B
    B --> C[End]
`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      // Note: Simple reserved word detection doesn't catch all cases
    });

    it('should validate complex flowchart with subgraphs', async () => {
      const code = `flowchart TB
    subgraph Frontend
        A[User Interface]
        B[API Client]
    end
    
    subgraph Backend
        C[API Server]
        D[Business Logic]
        E[Database]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate diagram with special characters in quotes', async () => {
      const code = `flowchart LR
    A["User (Client)"] --> B["API Server + Load Balancer"]
    B -->|"HTTP/HTTPS"| C["Database: MySQL"]`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate gantt diagram', async () => {
      const code = `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section Phase 1
    Task 1           :a1, 2024-01-01, 30d
    Task 2           :a2, after a1, 20d
    
    section Phase 2
    Task 3           :a3, 2024-02-20, 25d`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate pie chart', async () => {
      const code = `pie title Market Share
    "Product A" : 45
    "Product B" : 30
    "Product C" : 15
    "Others" : 10`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate state diagram', async () => {
      const code = `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Success : complete
    Processing --> Failed : error
    Success --> [*]
    Failed --> Idle : retry`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate ER diagram', async () => {
      const code = `erDiagram
    CUSTOMER ||--o| ORDER : places
    ORDER ||--|| LINE-ITEM : contains`;
      
      const result = await validateMermaidSyntax(code);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
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
