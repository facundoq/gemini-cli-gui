import { promises as fs } from 'fs';
import path from 'path';
import { loadProjectConfig, saveProjectConfig } from './config.ts';
import { generateDisplayName } from './naming.ts';
import { extractProjectDirectory } from './extraction.ts';
import { getSessions } from './sessions.ts';
import { clearProjectDirectoryCache } from './cache.ts';

/**
 * List all projects
 */
export async function getProjects() {
  const geminiDir = path.join(process.env.HOME || '', '.gemini', 'projects');
  const config = await loadProjectConfig();
  const projects: any[] = [];
  const existingProjects = new Set<string>();
  
  try {
    const entries = await fs.readdir(geminiDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        existingProjects.add(entry.name);
        const actualProjectDir = await extractProjectDirectory(entry.name);
        const customName = config[entry.name]?.displayName;
        const autoDisplayName = await generateDisplayName(entry.name, actualProjectDir);
        
        const project: any = {
          name: entry.name,
          path: actualProjectDir,
          displayName: customName || autoDisplayName,
          fullPath: actualProjectDir,
          isCustomName: !!customName,
          sessions: []
        };
        
        try {
          const sessionManager = (await import('../sessionManager.js')).default;
          const allSessions = sessionManager.getProjectSessions(actualProjectDir);
          const paginatedSessions = allSessions.slice(0, 5);
          project.sessions = paginatedSessions;
          project.sessionMeta = {
            hasMore: allSessions.length > 5,
            total: allSessions.length
          };
        } catch (e) {
          // console.warn(`Could not load sessions for project ${entry.name}:`, e.message);
        }
        
        projects.push(project);
      }
    }
  } catch (error) {
    // console.error('Error reading projects directory:', error);
  }
  
  for (const [projectName, projectConfig] of Object.entries(config) as [string, any][]) {
    if (!existingProjects.has(projectName) && projectConfig.manuallyAdded) {
      let actualProjectDir = projectConfig.originalPath;
      if (!actualProjectDir) {
        try {
          actualProjectDir = await extractProjectDirectory(projectName);
        } catch (error) {
          actualProjectDir = projectName.replace(/-/g, '/');
        }
      }
      
      const project = {
        name: projectName,
        path: actualProjectDir,
        displayName: projectConfig.displayName || await generateDisplayName(projectName, actualProjectDir),
        fullPath: actualProjectDir,
        isCustomName: !!projectConfig.displayName,
        isManuallyAdded: true,
        sessions: []
      };
      
      projects.push(project);
    }
  }
  
  return projects;
}

export async function renameProject(projectName: string, newDisplayName: string) {
  const config = await loadProjectConfig();
  if (!newDisplayName || newDisplayName.trim() === '') {
    delete config[projectName];
  } else {
    config[projectName] = {
      ...config[projectName],
      displayName: newDisplayName.trim()
    };
  }
  await saveProjectConfig(config);
  return true;
}

export async function isProjectEmpty(projectName: string) {
  try {
    const sessionsResult = await getSessions(projectName, 1, 0);
    return sessionsResult.total === 0;
  } catch (error) {
    return false;
  }
}

export async function deleteProject(projectName: string) {
  const projectDir = path.join(process.env.HOME || '', '.gemini', 'projects', projectName);
  try {
    const isEmpty = await isProjectEmpty(projectName);
    if (!isEmpty) {
      throw new Error('Cannot delete project with existing sessions');
    }
    await fs.rm(projectDir, { recursive: true, force: true });
    const config = await loadProjectConfig();
    delete config[projectName];
    await saveProjectConfig(config);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function addProjectManually(projectPath: string, displayName: string | null = null) {
  const absolutePath = path.resolve(projectPath);
  try {
    await fs.access(absolutePath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(absolutePath, { recursive: true });
    } else {
      throw new Error(`Cannot access path: ${absolutePath} - ${error.message}`);
    }
  }
  
  const projectName = Buffer.from(absolutePath).toString('base64').replace(/[/+=]/g, '_');
  const config = await loadProjectConfig();
  const projectDir = path.join(process.env.HOME || '', '.gemini', 'projects', projectName);
  
  try {
    await fs.access(projectDir);
    throw new Error(`Project already exists for path: ${absolutePath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  if (config[projectName]) {
    throw new Error(`Project already configured for path: ${absolutePath}`);
  }
  
  config[projectName] = {
    manuallyAdded: true,
    originalPath: absolutePath
  };
  
  if (displayName) {
    config[projectName].displayName = displayName;
  }
  
  await saveProjectConfig(config);
  
  try {
    await fs.mkdir(projectDir, { recursive: true });
  } catch (error) {}
  
  return {
    name: projectName,
    path: absolutePath,
    fullPath: absolutePath,
    displayName: displayName || await generateDisplayName(projectName, absolutePath),
    isManuallyAdded: true,
    sessions: []
  };
}
