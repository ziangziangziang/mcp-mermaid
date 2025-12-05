import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load prompts/resources from external files
function loadPromptsConfig() {
  const promptsDir = path.join(__dirname, "..", "guides");
  const configPath = path.join(promptsDir, "prompts.json");
  
  if (!fs.existsSync(configPath)) {
    return { prompts: [], resources: [] };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse prompts.json; skipping dynamic prompts/resources:", err);
    return { prompts: [], resources: [] };
  }
}

// Validate Mermaid syntax
export async function validateMermaidSyntax(code: string): Promise<{ valid: boolean; error?: string; warnings?: string[] }> {
  try {
    // Basic syntax checks
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { valid: false, error: "Empty diagram code" };
    }

    // Check for diagram type
    const diagramTypes = [
      'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram-v2', 'stateDiagram',
      'erDiagram', 'gantt', 'pie', 'quadrantChart', 'requirementDiagram', 'gitGraph',
      'C4Context', 'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment',
      'mindmap', 'timeline', 'zenuml', 'sankey-beta', 'xychart-beta', 'block-beta',
      'packet-beta', 'architecture-beta', 'kanban', 'treemap', 'radar'
    ];

    const hasValidType = diagramTypes.some(type => 
      trimmedCode.startsWith(type) || trimmedCode.includes(`\n${type}`)
    );

    if (!hasValidType) {
      return { 
        valid: false, 
        error: `No valid diagram type found. Must start with one of: ${diagramTypes.slice(0, 10).join(', ')}, etc.` 
      };
    }

    const warnings: string[] = [];

    // Check for common issues
    if (trimmedCode.toLowerCase().includes('\nend\n') || trimmedCode.toLowerCase().endsWith('\nend')) {
      warnings.push("Using 'end' as a node name may cause issues. Consider using 'End' or '[end]' instead.");
    }

    // Check for unmatched brackets
    const openBrackets = (trimmedCode.match(/\[/g) || []).length;
    const closeBrackets = (trimmedCode.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return { valid: false, error: `Unmatched brackets: ${openBrackets} '[' vs ${closeBrackets} ']'` };
    }

    const openParens = (trimmedCode.match(/\(/g) || []).length;
    const closeParens = (trimmedCode.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { valid: false, error: `Unmatched parentheses: ${openParens} '(' vs ${closeParens} ')'` };
    }

    const openBraces = (trimmedCode.match(/\{/g) || []).length;
    const closeBraces = (trimmedCode.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return { valid: false, error: `Unmatched braces: ${openBraces} '{' vs ${closeBraces} '}'` };
    }

    // Check for unclosed quotes in labels
    const labelMatches = trimmedCode.match(/\[[^\]]*\]/g) || [];
    for (const label of labelMatches) {
      const quoteCount = (label.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        warnings.push(`Possible unclosed quote in label: ${label}`);
      }
    }

    if (warnings.length > 0) {
      return { valid: true, warnings };
    }
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false, 
      error: `Validation error: ${error.message || String(error)}` 
    };
  }
}

// Diagram type information
const DIAGRAM_TYPES = [
  { name: "flowchart", alias: ["graph"], description: "General purpose flow diagrams with nodes and edges" },
  { name: "sequenceDiagram", description: "Message flows and interactions between actors over time" },
  { name: "classDiagram", description: "Object-oriented class structures and relationships" },
  { name: "stateDiagram-v2", alias: ["stateDiagram"], description: "State machines and transitions" },
  { name: "erDiagram", description: "Entity-relationship diagrams for databases" },
  { name: "gantt", description: "Project timelines and schedules" },
  { name: "pie", description: "Pie charts for proportional data" },
  { name: "quadrantChart", description: "2x2 prioritization matrices" },
  { name: "requirementDiagram", description: "Requirements engineering diagrams" },
  { name: "gitGraph", description: "Git commit history visualization" },
  { name: "C4Context", alias: ["C4Container", "C4Component", "C4Dynamic", "C4Deployment"], description: "C4 model architecture diagrams" },
  { name: "mindmap", description: "Hierarchical mind mapping" },
  { name: "timeline", description: "Historical events and milestones" },
  { name: "zenuml", description: "Alternative sequence diagram syntax" },
  { name: "sankey-beta", description: "Flow quantities between nodes" },
  { name: "xychart-beta", description: "XY coordinate charts and graphs" },
  { name: "block-beta", description: "Block-based diagrams" },
  { name: "packet-beta", description: "Network packet structures" },
  { name: "architecture-beta", description: "System architecture diagrams" },
  { name: "kanban", description: "Kanban boards" },
  { name: "treemap", description: "Hierarchical treemap visualizations" },
  { name: "radar", description: "Multi-dimensional radar charts" },
];

export function buildMermaidMcpServer() {
  const server = new McpServer({
    name: "mermaid-mcp",
    version: "1.0.0",
  });

  // Load prompts/resources configuration
  const config = loadPromptsConfig();
  const promptsDir = path.join(__dirname, "..", "guides");
  const mermaidDocsDir = path.join(__dirname, "..", "mermaid", "docs", "syntax");

  // Register Mermaid documentation files as resources
  const syntaxFiles = [
    { name: "flowchart", file: "flowchart.md", description: "Flowchart syntax and examples" },
    { name: "sequence", file: "sequenceDiagram.md", description: "Sequence diagram syntax" },
    { name: "class", file: "classDiagram.md", description: "Class diagram syntax" },
    { name: "state", file: "stateDiagram.md", description: "State diagram syntax" },
    { name: "er", file: "entityRelationshipDiagram.md", description: "Entity relationship diagram syntax" },
    { name: "gantt", file: "gantt.md", description: "Gantt chart syntax" },
    { name: "pie", file: "pie.md", description: "Pie chart syntax" },
    { name: "quadrant", file: "quadrantChart.md", description: "Quadrant chart syntax" },
    { name: "requirement", file: "requirementDiagram.md", description: "Requirement diagram syntax" },
    { name: "gitgraph", file: "gitgraph.md", description: "Git graph syntax" },
    { name: "c4", file: "c4.md", description: "C4 diagram syntax" },
    { name: "mindmap", file: "mindmap.md", description: "Mindmap syntax" },
    { name: "timeline", file: "timeline.md", description: "Timeline syntax" },
    { name: "zenuml", file: "zenuml.md", description: "ZenUML syntax" },
    { name: "sankey", file: "sankey.md", description: "Sankey diagram syntax" },
    { name: "xychart", file: "xyChart.md", description: "XY chart syntax" },
    { name: "block", file: "block.md", description: "Block diagram syntax" },
    { name: "packet", file: "packet.md", description: "Packet diagram syntax" },
    { name: "architecture", file: "architecture.md", description: "Architecture diagram syntax" },
    { name: "kanban", file: "kanban.md", description: "Kanban board syntax" },
    { name: "user-journey", file: "userJourney.md", description: "User journey syntax" },
    { name: "treemap", file: "treemap.md", description: "Treemap syntax" },
    { name: "radar", file: "radar.md", description: "Radar chart syntax" },
  ];

  for (const syntaxFile of syntaxFiles) {
    const uri = `mermaid://syntax/${syntaxFile.name}`;
    server.registerResource(
      syntaxFile.name,
      uri,
      {
        description: syntaxFile.description,
        mimeType: "text/markdown",
      },
      async () => {
        const filePath = path.join(mermaidDocsDir, syntaxFile.file);
        if (!fs.existsSync(filePath)) {
          return {
            contents: [{
              uri,
              mimeType: "text/markdown",
              text: `Documentation file not found: ${syntaxFile.file}`,
            }],
          };
        }

        const content = fs.readFileSync(filePath, "utf-8");
        return {
          contents: [{
            uri,
            mimeType: "text/markdown",
            text: content,
          }],
        };
      }
    );
  }

  // Register resources dynamically from config (if any)
  for (const resource of config.resources || []) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        description: `${resource.description} ⚠️ Use search_resource tool to query this reference.`,
        mimeType: resource.mimeType || "text/markdown",
      },
      async () => {
        const filePath = path.join(promptsDir, resource.file);
        if (!fs.existsSync(filePath)) {
          return {
            contents: [{
              uri: resource.uri,
              mimeType: resource.mimeType || "text/markdown",
              text: `Resource file not found: ${resource.file}`,
            }],
          };
        }

        const content = fs.readFileSync(filePath, "utf-8");

        return {
          contents: [{
            uri: resource.uri,
            mimeType: resource.mimeType || "text/markdown",
            text: content,
          }],
        };
      }
    );
  }

  // Register prompts dynamically
  for (const prompt of config.prompts || []) {
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: `${prompt.description} ⚠️ READ THIS PROMPT BEFORE working with ANY Mermaid diagram!`,
      },
      async () => {
        const filePath = path.join(promptsDir, prompt.file);
        if (!fs.existsSync(filePath)) {
          return {
            messages: [{
              role: "user" as const,
              content: {
                type: "text" as const,
                text: `Prompt file not found: ${prompt.file}`,
              },
            }],
          };
        }

        const content = fs.readFileSync(filePath, "utf-8");

        return {
          messages: [{
            role: "user" as const,
            content: {
              type: "text" as const,
              text: content,
            },
          }],
        };
      }
    );
  }

  // ---- Tool: search_resource ----
  server.registerTool(
    "search_resource",
    {
      title: "Search Mermaid Documentation",
      description: "Search the official Mermaid documentation for specific patterns, keywords, or diagram types. Returns matching lines with context. After finding syntax, ALWAYS validate the final diagram with validate_mermaid tool.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Text to search for (e.g., 'flowchart arrows', 'sequence notes', 'class relationships')"),
        caseSensitive: z.boolean().optional().default(false).describe("Whether the search is case-sensitive"),
        maxResults: z.number().optional().default(50).describe("Maximum matches to return"),
        contextLines: z.number().optional().default(3).describe("Number of lines to show before and after each match for context"),
      }),
    },
    async ({ query, caseSensitive = false, maxResults = 50, contextLines = 3 }) => {
      const needle = caseSensitive ? query : query.toLowerCase();
      const maxHits = Math.max(1, Math.min(maxResults, 200));
      const results = [];

      // Search through Mermaid documentation files
      if (!fs.existsSync(mermaidDocsDir)) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: "Mermaid documentation directory not found." }, null, 2),
            },
          ],
          isError: true,
        };
      }

      const syntaxFiles = fs.readdirSync(mermaidDocsDir).filter(f => f.endsWith('.md'));
      
      for (const fileName of syntaxFiles) {
        const filePath = path.join(mermaidDocsDir, fileName);
        const raw = fs.readFileSync(filePath, "utf-8");
        const lines = raw.split(/\r?\n/);
        const matches: Array<{ line: number; text: string; context: string[] }> = [];

        for (let i = 0; i < lines.length && matches.length < maxHits; i++) {
          const line = lines[i];
          if (!line) continue;
          const haystack = caseSensitive ? line : line.toLowerCase();
          
          if (haystack.includes(needle)) {
            // Get context lines before and after
            const startLine = Math.max(0, i - contextLines);
            const endLine = Math.min(lines.length - 1, i + contextLines);
            const context = [];
            
            for (let j = startLine; j <= endLine; j++) {
              const prefix = j === i ? ">>> " : "    ";
              context.push(`${prefix}${lines[j]}`);
            }

            matches.push({
              line: i + 1,
              text: line.trimEnd(),
              context,
            });
          }
        }

        if (matches.length > 0) {
          results.push({
            file: fileName,
            matchCount: matches.length,
            matches,
          });
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ 
              query, 
              totalFiles: results.length,
              totalMatches: results.reduce((sum, r) => sum + r.matchCount, 0),
              results 
            }, null, 2),
          },
        ],
      };
    }
  );

  // ---- Tool: validate_mermaid ----
  server.registerTool(
    "validate_mermaid",
    {
      title: "Validate Mermaid Diagram",
      description: "⚠️ MANDATORY: Validate Mermaid diagram syntax before presenting to users. ALWAYS use this tool after creating or modifying ANY diagram. Returns validation status, errors, and warnings. Invalid diagrams will fail to render - validation is NOT optional!",
      inputSchema: z.object({
        code: z.string().describe("The Mermaid diagram code to validate"),
      }),
    },
    async ({ code }) => {
      try {
        const result = await validateMermaidSyntax(code);
        
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
          isError: !result.valid,
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ 
                valid: false,
                error: `Validation failed: ${error.message || String(error)}` 
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ---- Tool: list_diagram_types ----
  server.registerTool(
    "list_diagram_types",
    {
      title: "List Diagram Types",
      description: "List all available Mermaid diagram types with descriptions. Use this to discover what diagram types are available.",
      inputSchema: z.object({}),
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              diagramTypes: DIAGRAM_TYPES,
              totalCount: DIAGRAM_TYPES.length,
            }, null, 2),
          },
        ],
      };
    }
  );

  // ---- Tool: get_examples ----
  server.registerTool(
    "get_examples",
    {
      title: "Get Diagram Examples",
      description: "Get working examples for a specific diagram type. Returns multiple examples with explanations. After using examples to create your diagram, you MUST validate it with validate_mermaid tool before showing to users.",
      inputSchema: z.object({
        diagramType: z.string().describe("The diagram type (e.g., 'flowchart', 'sequenceDiagram', 'classDiagram')"),
      }),
    },
    async ({ diagramType }) => {
      // Search for examples in the reference
      const filePath = path.join(promptsDir, "reference.md");
      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: "Reference file not found" }, null, 2),
            },
          ],
          isError: true,
        };
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const sections = content.split(/^## /m);
      
      // Find the section for this diagram type
      const normalizedType = diagramType.toLowerCase().replace(/[- ]/g, '');
      const matchingSection = sections.find(section => 
        section.toLowerCase().replace(/[- ]/g, '').startsWith(normalizedType)
      );

      if (!matchingSection) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ 
                error: `No examples found for diagram type: ${diagramType}`,
                availableTypes: DIAGRAM_TYPES.map(t => t.name)
              }, null, 2),
            },
          ],
          isError: true,
        };
      }

      // Extract code blocks from the section
      const codeBlocks = matchingSection.match(/```mermaid\n([\s\S]*?)```/g) || [];
      const examples = codeBlocks.map(block => 
        block.replace(/```mermaid\n/, '').replace(/```$/, '').trim()
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              diagramType,
              examplesCount: examples.length,
              examples,
              section: matchingSection.substring(0, 500) + (matchingSection.length > 500 ? '...' : ''),
            }, null, 2),
          },
        ],
      };
    }
  );

  // ---- Tool: analyze_diagram ----
  server.registerTool(
    "analyze_diagram",
    {
      title: "Analyze Diagram Structure",
      description: "Analyze a Mermaid diagram and provide insights about its structure, complexity, and suggestions for improvement. This tool includes validation checking. Use this to verify diagram correctness and get optimization suggestions.",
      inputSchema: z.object({
        code: z.string().describe("The Mermaid diagram code to analyze"),
      }),
    },
    async ({ code }) => {
      try {
        const validation = await validateMermaidSyntax(code);
        
        // Extract diagram type
        const trimmedCode = code.trim();
        const firstLine = trimmedCode.split('\n')[0] || '';
        const diagramType = DIAGRAM_TYPES.find(dt => 
          firstLine.includes(dt.name) || dt.alias?.some(a => firstLine.includes(a))
        );

        // Count various elements
        const lineCount = trimmedCode.split('\n').length;
        const nodeCount = (trimmedCode.match(/[\[\(]\w+/g) || []).length;
        const arrowCount = (trimmedCode.match(/--+>|==+>|\.\.+>/g) || []).length;
        const hasSubgraphs = trimmedCode.includes('subgraph');
        const hasStyles = trimmedCode.includes('style ') || trimmedCode.includes('classDef');
        const hasComments = trimmedCode.includes('%%');

        const analysis = {
          valid: validation.valid,
          errors: validation.error ? [validation.error] : [],
          warnings: validation.warnings || [],
          diagramType: diagramType?.name || "unknown",
          statistics: {
            lineCount,
            estimatedNodeCount: nodeCount,
            estimatedConnectionCount: arrowCount,
            hasSubgraphs,
            hasStyles,
            hasComments,
          },
          suggestions: [] as string[],
        };

        // Add suggestions
        if (lineCount > 50) {
          analysis.suggestions.push("Consider breaking this into multiple diagrams or using subgraphs for better organization");
        }
        if (nodeCount > 20) {
          analysis.suggestions.push("Large number of nodes detected - consider grouping related nodes in subgraphs");
        }
        if (!hasComments && lineCount > 20) {
          analysis.suggestions.push("Add comments (using %%) to document complex parts of the diagram");
        }
        if (!hasStyles && nodeCount > 10) {
          analysis.suggestions.push("Consider adding styles or classes to highlight important nodes");
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ 
                error: `Analysis failed: ${error.message || String(error)}` 
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// Main execution
async function main() {
  const server = buildMermaidMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mermaid MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
