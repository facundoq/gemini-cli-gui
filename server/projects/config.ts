import { promises as fs } from 'fs';
import path from 'path';

const configPath = path.join(process.env.HOME || '', '.gemini', 'project-config.json');

export async function loadProjectConfig() {
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // Return empty config if file doesn't exist
    return {};
  }
}

export async function saveProjectConfig(config: any) {
  const dir = path.dirname(configPath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}
