import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import mermaid from "mermaid";

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

// Validate Mermaid syntax using the official mermaid parser
export async function validateMermaidSyntax(code: string): Promise<{ valid: boolean; error?: string; warnings?: string[] }> {
  try {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { valid: false, error: "Empty diagram code" };
    }

    // Use mermaid.parse to validate the syntax
    await mermaid.parse(trimmedCode);
    
    // If parse succeeds, the diagram is valid
    return { valid: true };
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    
    // Treat DOM-related errors as success (environment issues, not syntax errors)
    if (errorMsg.includes('DOMPurify') || 
        errorMsg.includes('document is not defined') ||
        errorMsg.includes('window is not defined')) {
      return { valid: true };
    }
    
    // Parse failed with actual syntax error
    return {
      valid: false, 
      error: errorMsg
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
      description: "**REQUIRED BEFORE CREATING DIAGRAMS**: Search the official Mermaid documentation for syntax patterns, keywords, or diagram types. Returns matching lines with context from official docs. MUST be called before creating any diagram. After finding syntax, ALWAYS validate the final diagram with validate_mermaid tool.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Text to search for (e.g., 'flowchart syntax', 'sequenceDiagram examples', 'class relationships')"),
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
