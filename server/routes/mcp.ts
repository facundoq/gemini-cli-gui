import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gemini CLI command routes

// GET /api/mcp/cli/list - List MCP servers using Gemini CLI
router.get('/cli/list', async (req, res) => {
  try {
    console.log('📋 Listing MCP servers using Gemini CLI');
    
    const { spawn } = await import('child_process');
    
    const process = spawn('gemini', ['mcp', 'list'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, output: stdout, servers: parseGeminiListOutput(stdout) });
      } else {
        console.error('Gemini CLI error:', stderr);
        res.status(500).json({ error: 'Gemini CLI command failed', details: stderr });
      }
    });
    
    process.on('error', (error) => {
      console.error('Error running Gemini CLI:', error);
      res.status(500).json({ error: 'Failed to run Gemini CLI', details: error.message });
    });
  } catch (error) {
    console.error('Error listing MCP servers via CLI:', error);
    res.status(500).json({ error: 'Failed to list MCP servers', details: error.message });
  }
});

// POST /api/mcp/cli/add - Add MCP server using Gemini CLI
router.post('/cli/add', async (req, res) => {
  try {
    const { name, type = 'stdio', command, args = [], url, headers = {}, env = {}, scope = 'project' } = req.body;
    
    console.log('➕ Adding MCP server using Gemini CLI:', name);
    
    const { spawn } = await import('child_process');
    
    let cliArgs = ['mcp', 'add', '--scope', scope, '--transport', type];
    
    if (type === 'http' || type === 'sse') {
      cliArgs.push(name, url);
      // Add headers if provided
      Object.entries(headers).forEach(([key, value]) => {
        cliArgs.push('--header', `${key}: ${value}`);
      });
    } else {
      // stdio: gemini mcp add <name> <command> [args...]
      cliArgs.push(name);
      // Add environment variables
      Object.entries(env).forEach(([key, value]) => {
        cliArgs.push('--env', `${key}=${value}`);
      });
      cliArgs.push(command);
      if (args && args.length > 0) {
        cliArgs.push(...args);
      }
    }
    
    console.log('🔧 Running Gemini CLI command:', 'gemini', cliArgs.join(' '));
    
    const process = spawn('gemini', cliArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, output: stdout, message: `MCP server "${name}" added successfully` });
      } else {
        console.error('Gemini CLI error:', stderr);
        res.status(400).json({ error: 'Gemini CLI command failed', details: stderr });
      }
    });
    
    process.on('error', (error) => {
      console.error('Error running Gemini CLI:', error);
      res.status(500).json({ error: 'Failed to run Gemini CLI', details: error.message });
    });
  } catch (error) {
    console.error('Error adding MCP server via CLI:', error);
    res.status(500).json({ error: 'Failed to add MCP server', details: error.message });
  }
});

// DELETE /api/mcp/cli/remove/:name - Remove MCP server using Gemini CLI
router.delete('/cli/remove/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { scope = 'project' } = req.query;
    
    console.log('🗑️ Removing MCP server using Gemini CLI:', name);
    
    const { spawn } = await import('child_process');
    
    const process = spawn('gemini', ['mcp', 'remove', '--scope', scope, name], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, output: stdout, message: `MCP server "${name}" removed successfully` });
      } else {
        console.error('Gemini CLI error:', stderr);
        res.status(400).json({ error: 'Gemini CLI command failed', details: stderr });
      }
    });
    
    process.on('error', (error) => {
      console.error('Error running Gemini CLI:', error);
      res.status(500).json({ error: 'Failed to run Gemini CLI', details: error.message });
    });
  } catch (error) {
    console.error('Error removing MCP server via CLI:', error);
    res.status(500).json({ error: 'Failed to remove MCP server', details: error.message });
  }
});

// GET /api/mcp/cli/get/:name - Get MCP server details using Gemini CLI
router.get('/cli/get/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    console.log('📄 Getting MCP server details using Gemini CLI:', name);
    
    const { spawn } = await import('child_process');
    
    const process = spawn('gemini', ['mcp', 'list'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        const servers = parseGeminiListOutput(stdout);
        const server = servers.find(s => s.name === name);
        if (server) {
          res.json({ success: true, server });
        } else {
          res.status(404).json({ error: `MCP server "${name}" not found` });
        }
      } else {
        console.error('Gemini CLI error:', stderr);
        res.status(500).json({ error: 'Gemini CLI command failed', details: stderr });
      }
    });
    
    process.on('error', (error) => {
      console.error('Error running Gemini CLI:', error);
      res.status(500).json({ error: 'Failed to run Gemini CLI', details: error.message });
    });
  } catch (error) {
    console.error('Error getting MCP server details via CLI:', error);
    res.status(500).json({ error: 'Failed to get MCP server details', details: error.message });
  }
});

// Helper functions to parse Gemini CLI output
function parseGeminiListOutput(output) {
  // Parse output from 'gemini mcp list'
  // Example format: "✓ name (source): command (transport) - Connected"
  const servers = [];
  const lines = output.split('\n').filter(line => line.trim() && !line.includes('Configured MCP servers:'));
  
  for (const line of lines) {
    // Regex for parsing: ✓? name (from source)?: command (transport) - status
    const match = line.match(/^(?:✓|✗)?\s*([^\s(:]+)(?:\s+\(from\s+([^)]+)\))?:\s+(.+)\s+\(([^)]+)\)\s+-\s+(.+)$/);
    if (match) {
      const [, name, source, command, transport, status] = match;
      servers.push({
        name,
        source: source || 'user',
        command,
        type: transport.toLowerCase(),
        status: status.toLowerCase()
      });
    }
  }
  
  console.log('🔍 Parsed Gemini CLI servers:', servers);
  return servers;
  }

  export default router;