interface Operation {
  path: string;
  method: string;
}

interface Parameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: {
    type: string;
  };
}

interface Response {
  description?: string;
  content?: {
    "application/json"?: {
      schema?: unknown;
    };
  };
}

interface OpenAPISpec {
  paths?: Record<
    string,
    Record<
      string,
      {
        summary?: string;
        description?: string;
        parameters?: Parameter[];
        requestBody?: {
          content?: {
            "application/json"?: {
              schema?: unknown;
            };
          };
        };
        responses?: Record<string, Response>;
      }
    >
  >;
}

/**
 * Generate markdown documentation from an OpenAPI specification.
 * This is the same logic that was previously in lib/files.ts getApiDocContent(),
 * but now runs at build time instead of runtime.
 *
 * @param spec - The OpenAPI specification object
 * @param operations - Array of operations to document (path + method pairs)
 * @returns Markdown string
 */
export function generateMarkdownFromSpec(
  spec: OpenAPISpec,
  operations: Operation[]
): string {
  let markdown = "";

  operations.forEach(({ path: opPath, method }) => {
    const op = spec.paths?.[opPath]?.[method];
    if (!op) return;

    markdown += `## ${method.toUpperCase()} ${opPath}\n\n`;

    if (op.summary) {
      markdown += `**${op.summary}**\n\n`;
    }

    if (op.description) {
      markdown += `${op.description}\n\n`;
    }

    // Parameters
    if (op.parameters?.length) {
      markdown += "**Parameters:**\n\n";
      op.parameters.forEach((param) => {
        const required = param.required ? " (required)" : "";
        const type = param.schema?.type ? `: ${param.schema.type}` : "";
        markdown += `- \`${param.name}\` (${param.in}${type})${required}: ${param.description || ""}\n`;
      });
      markdown += "\n";
    }

    // Request body
    if (op.requestBody?.content?.["application/json"]?.schema) {
      markdown += "**Request Body:**\n\n";
      markdown += `\`\`\`json\n${JSON.stringify(op.requestBody.content["application/json"].schema, null, 2)}\n\`\`\`\n\n`;
    }

    // Response
    const responses = op.responses || {};
    const successResponse =
      responses["200"] || responses["201"] || responses["204"];
    if (successResponse) {
      markdown += "**Success Response:**\n\n";
      if (successResponse.description) {
        markdown += `${successResponse.description}\n\n`;
      }
      if (successResponse.content?.["application/json"]?.schema) {
        markdown += `\`\`\`json\n${JSON.stringify(successResponse.content["application/json"].schema, null, 2)}\n\`\`\`\n\n`;
      }
    }

    markdown += "---\n\n";
  });

  return markdown.trim();
}
