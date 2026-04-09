import re

with open('server/index.ts', 'r') as f:
    content = f.read()

# 1. Add new imports
new_imports = """
import projectsRoutes from './routes/projects.routes.ts';
import filesRoutes from './routes/files.routes.ts';
import { setupWebSockets, getConnectedClients } from './websocket/index.ts';
"""
content = re.sub(r'(import { validateApiKey, authenticateToken, authenticateWebSocket } from \'\./middleware/auth\.ts\';)', r'\1' + new_imports, content)

# 2. Update connectedClients definition and usage
content = re.sub(r'const connectedClients = new Set\(\);\n', '', content)
content = re.sub(r'connectedClients\.forEach', 'getConnectedClients().forEach', content)

# 3. Replace projects endpoints and files endpoints (lines from app.get('/api/projects' to app.get('/api/projects/:projectName/files'))
content = re.sub(
    r"app\.get\('/api/projects', authenticateToken, async \(req, res\) => \{.*?(?=// WebSocket connection handler)",
    "// Project Routes\napp.use('/api/projects', authenticateToken, projectsRoutes);\n\n// File Routes\napp.use('/api/projects', authenticateToken, filesRoutes);\n\n",
    content,
    flags=re.DOTALL
)

# 4. Replace websocket handling logic
content = re.sub(
    r"// WebSocket connection handler that routes based on URL path\nwss\.on\('connection', \(ws, request\) => \{.*?(?=// Audio transcription endpoint)",
    "setupWebSockets(wss);\n\n",
    content,
    flags=re.DOTALL
)

# 5. Remove getFileTree and permToRwx
content = re.sub(
    r"// Helper function to convert permissions to rwx format\nfunction permToRwx\(perm\).*?return items\.sort\(\(a, b\) => \{.*?\}\);\n\}\n",
    "",
    content,
    flags=re.DOTALL
)

with open('server/index.ts', 'w') as f:
    f.write(content)
