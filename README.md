# Mermaid MCP Server

A Model Context Protocol (MCP) server that provides comprehensive Mermaid diagram syntax reference and compilation checking for AI agents. When added to an agent, it enables the agent to create, fix, and improve **all types** of Mermaid diagrams.

## 🎯 Features

### Tools

1. **`validate_mermaid`** - Validate Mermaid diagram syntax
   - Checks for syntax errors
   - Detects unmatched brackets, quotes, and parentheses
   - Identifies common pitfalls (like using "end" as node name)
   - Returns warnings and error messages

2. **`search_resource`** - Search syntax reference
   - Quickly find syntax patterns in the comprehensive reference
   - Search for specific diagram features (e.g., "arrows", "notes", "styling")
   - Case-sensitive and case-insensitive options

3. **`list_diagram_types`** - List all available diagram types
   - Shows all 20+ Mermaid diagram types
   - Includes descriptions for each type
   - Helps agents choose the right diagram for the use case

4. **`get_examples`** - Get working examples
   - Retrieves multiple examples for specific diagram types
   - Provides syntactically correct starting points
   - Includes explanations

5. **`analyze_diagram`** - Analyze diagram structure
   - Provides insights about diagram complexity
   - Counts nodes, connections, and other elements
   - Offers suggestions for improvement

### Resources

- **`syntax-reference`** - Complete syntax reference for all Mermaid diagram types
  - Flowcharts, Sequence Diagrams, Class Diagrams
  - State Diagrams, ER Diagrams, Gantt Charts
  - Git Graphs, Mindmaps, Timelines
  - Pie Charts, XY Charts, Quadrant Charts
  - And 15+ more diagram types with examples

### Prompts

- **`guide`** - Quick routing guide
  - Helps choose the right diagram type
  - Common issues and solutions
  - Best practices

## 📦 Supported Diagram Types

### Flow & Process
- **Flowchart** - General purpose diagrams
- **Sequence Diagram** - Actor interactions
- **State Diagram** - State transitions
- **Gantt Chart** - Project timelines
- **User Journey** - User experience flows

### Structure & Organization
- **Class Diagram** - OOP structures
- **ER Diagram** - Database schemas
- **C4 Diagram** - Software architecture
- **Architecture Diagram** - System architectures
- **Block Diagram** - Block layouts

### Data & Analysis
- **Pie Chart** - Proportional data
- **XY Chart** - Coordinate data
- **Quadrant Chart** - 2x2 matrices
- **Sankey Diagram** - Flow quantities
- **Treemap** - Hierarchical data
- **Radar Chart** - Multi-dimensional data

### Specialized
- **Git Graph** - Git commit history
- **Mindmap** - Hierarchical thinking
- **Timeline** - Historical events
- **Requirement Diagram** - Requirements engineering
- **Packet Diagram** - Network packets
- **Kanban** - Kanban boards
- **ZenUML** - Alternative sequence diagrams

## 🚀 Installation

### Prerequisites

- Node.js 18+ (for ESM support)
- npm or pnpm

### Setup

1. **Install dependencies:**

```bash
npm install
# or
pnpm install
```

2. **Build the project:**

```bash
npm run build
```

3. **Start the server:**

```bash
# STDIO mode (for MCP clients)
npm run start:stdio

# HTTP mode (for testing)
npm run start:http
```

## 🔧 Configuration

### MCP Client Configuration

Add to your MCP client configuration (e.g., GitHub Copilot, Claude Desktop):

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": ["/path/to/mcp-mermaid/dist/server.js"],
      "env": {}
    }
  }
}
```

### For Development

Create a `.env` file if needed for custom configuration:

```env
# Add any environment variables here
NODE_ENV=development
```

## 📖 Usage Examples

### Validating a Diagram

```typescript
// Agent uses the validate_mermaid tool
{
  "code": "flowchart LR\n    A[Start] --> B[End]"
}

// Returns:
{
  "valid": true,
  "warnings": []
}
```

### Searching for Syntax

```typescript
// Agent searches for arrow syntax
{
  "query": "arrow types",
  "caseSensitive": false
}

// Returns matching lines from reference
```

### Getting Examples

```typescript
// Agent requests sequence diagram examples
{
  "diagramType": "sequenceDiagram"
}

// Returns multiple working examples
```

### Analyzing a Diagram

```typescript
// Agent analyzes diagram complexity
{
  "code": "flowchart TD\n    A --> B\n    B --> C\n    ..."
}

// Returns:
{
  "valid": true,
  "diagramType": "flowchart",
  "statistics": {
    "lineCount": 10,
    "estimatedNodeCount": 8,
    "estimatedConnectionCount": 7
  },
  "suggestions": [...]
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🏗️ Project Structure

```
mcp-mermaid/
├── src/
│   └── server.ts          # Main MCP server implementation
├── guides/
│   ├── prompts.json       # Prompts and resources configuration
│   ├── guide.md          # Quick reference guide
│   └── reference.md      # Comprehensive syntax reference
├── dist/                  # Compiled TypeScript output
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Agent Use Cases

When this MCP is added to an agent, the agent can:

1. **Create Diagrams** - Generate syntactically correct Mermaid diagrams for any use case
2. **Fix Errors** - Validate and fix syntax errors in existing diagrams
3. **Improve Diagrams** - Analyze and suggest improvements for better clarity
4. **Convert Formats** - Convert between different diagram types
5. **Answer Questions** - Provide syntax help and examples on demand
6. **Optimize Layout** - Suggest better organization and structure

## 🔍 Common Workflows

### Creating a New Diagram

1. Agent determines diagram type using `list_diagram_types` or the guide
2. Agent searches for relevant syntax using `search_resource`
3. Agent gets examples using `get_examples`
4. Agent creates the diagram
5. Agent validates with `validate_mermaid`

### Fixing a Diagram

1. User provides broken diagram
2. Agent validates with `validate_mermaid`
3. Agent identifies errors from validation response
4. Agent searches for correct syntax using `search_resource`
5. Agent fixes and revalidates

### Improving a Diagram

1. Agent analyzes with `analyze_diagram`
2. Agent reviews suggestions
3. Agent searches for styling/organization patterns
4. Agent applies improvements
5. Agent validates final result

## 📚 Resources

- [Mermaid Official Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 🤝 Contributing

This MCP server is designed to be comprehensive and extensible. Contributions are welcome for:

- Additional diagram type examples
- Enhanced validation rules
- Performance improvements
- Documentation updates

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

zziang@stjude.org

---

**Note**: This MCP server provides syntax reference and validation. The actual diagram rendering should be done by Mermaid.js in the client application or web interface.
