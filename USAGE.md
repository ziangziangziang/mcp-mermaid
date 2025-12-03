# Mermaid MCP Usage Guide

## Quick Start

After building and installing the MCP server, agents can use these tools to work with Mermaid diagrams.

## Available Tools

### 1. `validate_mermaid`

**Purpose**: Check if a Mermaid diagram has valid syntax.

**Example Usage**:
```json
{
  "code": "flowchart LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]"
}
```

**Response**:
```json
{
  "valid": true
}
```

Or with errors:
```json
{
  "valid": false,
  "error": "Unmatched brackets: 3 '[' vs 2 ']'",
  "warnings": []
}
```

---

### 2. `search_resource`

**Purpose**: Search the comprehensive syntax reference for specific patterns.

**Example Usage**:
```json
{
  "query": "arrow types",
  "caseSensitive": false,
  "maxResults": 20
}
```

**Response**:
```json
{
  "query": "arrow types",
  "results": [
    {
      "resource": "syntax-reference",
      "matchCount": 5,
      "matches": [
        { "line": 45, "text": "### Arrow Types" },
        { "line": 52, "text": "    A --> B    %% Solid arrow" },
        ...
      ]
    }
  ]
}
```

---

### 3. `list_diagram_types`

**Purpose**: Get a list of all available Mermaid diagram types.

**Example Usage**:
```json
{}
```

**Response**:
```json
{
  "diagramTypes": [
    {
      "name": "flowchart",
      "alias": ["graph"],
      "description": "General purpose flow diagrams with nodes and edges"
    },
    {
      "name": "sequenceDiagram",
      "description": "Message flows and interactions between actors over time"
    },
    ...
  ],
  "totalCount": 22
}
```

---

### 4. `get_examples`

**Purpose**: Get working examples for a specific diagram type.

**Example Usage**:
```json
{
  "diagramType": "sequenceDiagram"
}
```

**Response**:
```json
{
  "diagramType": "sequenceDiagram",
  "examplesCount": 8,
  "examples": [
    "sequenceDiagram\n    Alice->>Bob: Hello Bob!\n    Bob-->>Alice: Hi Alice!",
    "sequenceDiagram\n    participant A as Alice\n    participant B as Bob\n    A->>B: Request\n    B-->>A: Response",
    ...
  ]
}
```

---

### 5. `analyze_diagram`

**Purpose**: Analyze diagram structure and get improvement suggestions.

**Example Usage**:
```json
{
  "code": "flowchart TD\n    A --> B\n    B --> C\n    C --> D\n    ..."
}
```

**Response**:
```json
{
  "valid": true,
  "diagramType": "flowchart",
  "statistics": {
    "lineCount": 25,
    "estimatedNodeCount": 15,
    "estimatedConnectionCount": 20,
    "hasSubgraphs": false,
    "hasStyles": false,
    "hasComments": false
  },
  "suggestions": [
    "Consider breaking this into multiple diagrams or using subgraphs for better organization",
    "Add comments (using %%) to document complex parts of the diagram",
    "Consider adding styles or classes to highlight important nodes"
  ]
}
```

---

## Common Agent Workflows

### Creating a Flowchart

1. **Choose diagram type**:
   ```
   Agent: I need to create a flowchart
   Tool: list_diagram_types
   Result: flowchart is the right type
   ```

2. **Search for syntax**:
   ```
   Agent: What syntax do I need for decision nodes?
   Tool: search_resource({ query: "diamond decision" })
   Result: Use {Text} for diamond shapes
   ```

3. **Create diagram**:
   ```mermaid
   flowchart TD
       A[Start] --> B{Decision}
       B -->|Yes| C[Action 1]
       B -->|No| D[Action 2]
   ```

4. **Validate**:
   ```
   Tool: validate_mermaid({ code: "..." })
   Result: { valid: true }
   ```

---

### Fixing a Broken Diagram

1. **User provides broken diagram**:
   ```mermaid
   flowchart LR
       A[Start --> B[End
   ```

2. **Validate and identify error**:
   ```
   Tool: validate_mermaid({ code: "..." })
   Result: { valid: false, error: "Unmatched brackets: 2 '[' vs 0 ']'" }
   ```

3. **Search for correct syntax**:
   ```
   Tool: search_resource({ query: "rectangle node" })
   Result: Nodes should be [Text] with matching brackets
   ```

4. **Fix and revalidate**:
   ```mermaid
   flowchart LR
       A[Start] --> B[End]
   ```
   ```
   Tool: validate_mermaid({ code: "..." })
   Result: { valid: true }
   ```

---

### Improving a Diagram

1. **Analyze current diagram**:
   ```
   Tool: analyze_diagram({ code: "..." })
   Result: {
     valid: true,
     suggestions: ["Add subgraphs for better organization", "Add styling"]
   }
   ```

2. **Search for styling syntax**:
   ```
   Tool: search_resource({ query: "styling classDef" })
   Result: Found styling examples
   ```

3. **Apply improvements**:
   ```mermaid
   flowchart TB
       classDef important fill:#f96,stroke:#333
       
       subgraph Process
           A[Start] --> B[Process]:::important
           B --> C[End]
       end
   ```

---

## Resources Available

### `syntax-reference` Resource

Complete reference covering:
- **25+ diagram types** with syntax
- **Node shapes** for flowcharts
- **Arrow types** and connections
- **Styling and theming**
- **Common pitfalls** and solutions
- **Quick tips** and best practices

Access via:
```
Resource URI: mermaid://syntax-reference
```

---

## Prompts Available

### `guide` Prompt

Quick routing guide that helps:
- Choose the right diagram type
- Understand common issues
- Follow best practices
- Know which tool to use when

---

## Testing the MCP Server

You can test the server locally:

```bash
# Build the project
npm run build

# Run in STDIO mode (for MCP clients)
npm run start:stdio

# Or test with HTTP mode
npm run start:http
```

---

## Integration with Agents

When this MCP is added to an AI agent (like GitHub Copilot in Agent mode), the agent gains:

✅ **Knowledge** of all Mermaid diagram types  
✅ **Validation** capabilities to check syntax  
✅ **Search** functionality to find examples quickly  
✅ **Analysis** tools to suggest improvements  
✅ **Examples** database with working code  

This enables the agent to create, fix, and improve **ALL types** of Mermaid diagrams autonomously!

---

## Supported Diagram Types Reference

| Type | Use Case |
|------|----------|
| flowchart | General workflows, processes, algorithms |
| sequenceDiagram | Actor interactions, API flows, message sequences |
| classDiagram | OOP design, class structures, UML |
| stateDiagram-v2 | State machines, lifecycles, FSMs |
| erDiagram | Database schemas, entity relationships |
| gantt | Project timelines, schedules, milestones |
| pie | Proportional data, percentages |
| quadrantChart | 2x2 matrices, prioritization |
| gitGraph | Git history, branches, merges |
| C4Context | Software architecture diagrams |
| mindmap | Brainstorming, hierarchical concepts |
| timeline | Historical events, chronology |
| xychart-beta | Coordinate data, trends |
| sankey-beta | Flow quantities, migrations |
| treemap | Hierarchical data with sizes |
| radar | Multi-dimensional comparisons |
| And more... | 22+ total diagram types supported! |

---

## Support

For issues or questions:
- Check the `reference.md` for syntax
- Use `search_resource` to find specific patterns
- Use `validate_mermaid` to debug errors
- Check [Mermaid Documentation](https://mermaid.js.org/)
