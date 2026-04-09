import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import readline from 'readline';
import { projectDirectoryCache } from './cache.ts';

/**
 * Extract the actual project directory from JSONL sessions (with caching)
 */
export async function extractProjectDirectory(projectName: string): Promise<string> {
  // Check cache first
  if (projectDirectoryCache.has(projectName)) {
    return projectDirectoryCache.get(projectName)!;
  }
  
  const projectDir = path.join(process.env.HOME || '', '.gemini', 'projects', projectName);
  const cwdCounts = new Map<string, number>();
  let latestTimestamp = 0;
  let latestCwd: string | null = null;
  let extractedPath: string | undefined;
  
  try {
    const files = await fs.readdir(projectDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      // Fall back to decoded project name if no sessions
      try {
        let base64Name = projectName.replace(/_/g, '+').replace(/-/g, '/');
        if (base64Name.endsWith('++')) {
          base64Name = base64Name.slice(0, -2) + '==';
        }
        extractedPath = Buffer.from(base64Name, 'base64').toString('utf8');
        extractedPath = extractedPath.replace(/[^\x20-\x7E]/g, '').trim();
      } catch (e) {
        extractedPath = projectName.replace(/-/g, '/');
      }
    } else {
      // Process all JSONL files to collect cwd values
      for (const file of jsonlFiles) {
        const jsonlFile = path.join(projectDir, file);
        const fileStream = fsSync.createReadStream(jsonlFile);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
        
        for await (const line of rl) {
          if (line.trim()) {
            try {
              const entry = JSON.parse(line);
              
              if (entry.cwd) {
                // Count occurrences of each cwd
                cwdCounts.set(entry.cwd, (cwdCounts.get(entry.cwd) || 0) + 1);
                
                // Track the most recent cwd
                const timestamp = new Date(entry.timestamp || 0).getTime();
                if (timestamp > latestTimestamp) {
                  latestTimestamp = timestamp;
                  latestCwd = entry.cwd;
                }
              }
            } catch (parseError) {
              // Skip malformed lines
            }
          }
        }
      }
      
      // Determine the best cwd to use
      if (cwdCounts.size === 0) {
        extractedPath = projectName.replace(/-/g, '/');
      } else if (cwdCounts.size === 1) {
        extractedPath = Array.from(cwdCounts.keys())[0];
      } else {
        const mostRecentCount = cwdCounts.get(latestCwd!) || 0;
        const maxCount = Math.max(...cwdCounts.values());
        
        if (mostRecentCount >= maxCount * 0.25) {
          extractedPath = latestCwd!;
        } else {
          for (const [cwd, count] of cwdCounts.entries()) {
            if (count === maxCount) {
              extractedPath = cwd;
              break;
            }
          }
        }
        
        if (!extractedPath) {
          try {
            extractedPath = latestCwd || Buffer.from(projectName.replace(/_/g, '+').replace(/-/g, '/'), 'base64').toString('utf8');
          } catch (e) {
            extractedPath = latestCwd || projectName.replace(/-/g, '/');
          }
        }
      }
    }
    
    extractedPath = extractedPath!.replace(/[^\x20-\x7E]/g, '').trim();
    projectDirectoryCache.set(projectName, extractedPath);
    return extractedPath;
    
  } catch (error) {
    try {
      let base64Name = projectName.replace(/_/g, '+').replace(/-/g, '/');
      if (base64Name.endsWith('++')) {
        base64Name = base64Name.slice(0, -2) + '==';
      }
      extractedPath = Buffer.from(base64Name, 'base64').toString('utf8');
      extractedPath = extractedPath.replace(/[^\x20-\x7E]/g, '').trim();
    } catch (e) {
      extractedPath = projectName.replace(/-/g, '/');
    }
    
    projectDirectoryCache.set(projectName, extractedPath);
    return extractedPath;
  }
}
