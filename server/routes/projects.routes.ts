import express from 'express';
import { 
  getProjects, 
  renameProject, 
  deleteProject, 
  addProjectManually, 
  extractProjectDirectory 
} from '../projects.js';
import sessionManager from '../sessionManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { path: projectPath } = req.body;
    
    if (!projectPath || !projectPath.trim()) {
      return res.status(400).json({ error: 'Project path is required' });
    }
    
    const project = await addProjectManually(projectPath.trim());
    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectName/sessions', async (req, res) => {
  try {
    const projectPath = await extractProjectDirectory(req.params.projectName);
    const sessions = sessionManager.getProjectSessions(projectPath);
    
    const { limit = 5, offset = 0 } = req.query;
    const paginatedSessions = sessions.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      sessions: paginatedSessions,
      total: sessions.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:projectName/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = sessionManager.getSessionMessages(sessionId);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:projectName/rename', async (req, res) => {
  try {
    const { displayName } = req.body;
    await renameProject(req.params.projectName, displayName);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:projectName/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sessionManager.deleteSession(sessionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    await deleteProject(projectName);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
