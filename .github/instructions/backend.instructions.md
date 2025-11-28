---
applyTo: "backend/**/*.js"
---

# Backend Development Instructions

## Stack
- Node.js 18+ with ES Modules (`"type": "module"`)
- Express.js for HTTP server
- No TypeScript — plain JavaScript with JSDoc comments
- Config via js-yaml (config.yaml)

## Architecture
- `parsers/` — Parser Registry Pattern for .det/.pou/.prt/.pvd files
- `services/` — Business logic (fileScanner, metadataService, fileMerger)
- `routes/` — Express route handlers
- `config.js` — Config loading from config.yaml

## Key Services
| Service | Purpose |
|---------|---------|
| `fileScanner.js` | Scans data folder for projects, watches for changes |
| `metadataService.js` | Manages project metadata (auto from .prt + manual) |
| `fileMerger.js` | Merges .det + .pou data into combined result |
| `fileModifier.js` | Renames/deletes calculations (modifies BOTH .det and .pou) |
| `prtQueue.js` | Queue for .prt file parsing (async-mutex) |

## Parser Registry Pattern
```
backend/src/parsers/
├── ParserRegistry.js    # Central registry
├── index.js             # Exports
├── common/              # Shared utilities
└── formats/             # Individual parsers
    ├── detParser.js     # .det files (24 params)
    ├── pouParser.js     # .pou files (71-78 params)
    ├── prtParser.js     # .prt project files
    └── pvdParser.js     # .pvd PV diagram files
```

**Adding new format:**
1. Create parser in `formats/newParser.js`
2. Register in `ParserRegistry.js`
3. Update `index.js` exports

## API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects` | List all projects |
| GET | `/api/project/:id` | Get project with calculations |
| GET | `/api/project/:id/pvd` | Get PV diagram data |
| PUT | `/api/project/:id/metadata` | Update metadata |
| PUT | `/api/project/:id/calculations/:calcId` | Rename calculation |
| DELETE | `/api/project/:id/calculations/:calcId` | Delete calculation |

## File Modification Rules
- `.prt` files: **READ-ONLY** (source data from EngMod4T)
- `.det`/`.pou` files: **LIMITED WRITE** (only calculation markers $1, $2, etc.)
- When modifying calculations: **ALWAYS modify BOTH** .det and .pou files
- Use atomic write pattern with rollback on error

## Error Handling
- Always return proper HTTP status codes
- Include error message in response body
- Log errors to console with context

## Common Patterns
```javascript
// ES Module imports
import express from 'express';
import { ParserRegistry } from '../parsers/index.js';

// Async route handler
router.get('/endpoint', async (req, res) => {
  try {
    const result = await someAsyncOperation();
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Testing
- Test files in backend root: `test-*.js`
- Run manually: `node test-parser.js`
- No automated test runner configured yet
