import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  getActualProjectPath, 
  validateGitRepository, 
  execAsync, 
  generateSimpleCommitMessage 
} from './service.js';

const router = express.Router();

// Get git status for a project
router.get('/status', async (req, res) => {
  const { project } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    await validateGitRepository(projectPath);

    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: projectPath });
    
    const modified: string[] = [];
    const added: string[] = [];
    const deleted: string[] = [];
    const untracked: string[] = [];
    
    statusOutput.split('\n').forEach(line => {
      if (!line.trim()) return;
      
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      if (status === 'M ' || status === ' M' || status === 'MM') {
        modified.push(file);
      } else if (status === 'A ' || status === 'AM') {
        added.push(file);
      } else if (status === 'D ' || status === ' D') {
        deleted.push(file);
      } else if (status === '??') {
        untracked.push(file);
      }
    });
    
    res.json({
      branch: branch.trim(),
      modified,
      added,
      deleted,
      untracked
    });
  } catch (error: any) {
    res.json({ 
      error: error.message.includes('not a git repository') || error.message.includes('Project directory is not a git repository') 
        ? error.message 
        : 'Git operation failed',
      details: error.message.includes('not a git repository') || error.message.includes('Project directory is not a git repository')
        ? error.message
        : `Failed to get git status: ${error.message}`
    });
  }
});

// Get diff for a specific file
router.get('/diff', async (req, res) => {
  const { project, file } = req.query;
  
  if (!project || !file) {
    return res.status(400).json({ error: 'Project name and file path are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    await validateGitRepository(projectPath);
    
    const { stdout: statusOutput } = await execAsync(`git status --porcelain "${file}"`, { cwd: projectPath });
    const isUntracked = statusOutput.startsWith('??');
    
    let diff;
    if (isUntracked) {
      const fileContent = await fs.readFile(path.join(projectPath, file as string), 'utf-8');
      const lines = fileContent.split('\n');
      diff = `--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n` + 
             lines.map(line => `+${line}`).join('\n');
    } else {
      const { stdout } = await execAsync(`git diff HEAD -- "${file}"`, { cwd: projectPath });
      diff = stdout || '';
      
      if (!diff) {
        const { stdout: stagedDiff } = await execAsync(`git diff --cached -- "${file}"`, { cwd: projectPath });
        diff = stagedDiff;
      }
    }
    
    res.json({ diff });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

// Commit changes
router.post('/commit', async (req, res) => {
  const { project, message, files } = req.body;
  
  if (!project || !message || !files || files.length === 0) {
    return res.status(400).json({ error: 'Project name, commit message, and files are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    await validateGitRepository(projectPath);
    
    for (const file of files) {
      await execAsync(`git add "${file}"`, { cwd: projectPath });
    }
    
    const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get list of branches
router.get('/branches', async (req, res) => {
  const { project } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    await validateGitRepository(projectPath);
    
    const { stdout } = await execAsync('git branch -a', { cwd: projectPath });
    
    const branches = stdout
      .split('\n')
      .map(branch => branch.trim())
      .filter(branch => branch && !branch.includes('->'))
      .map(branch => {
        if (branch.startsWith('* ')) {
          return branch.substring(2);
        }
        if (branch.startsWith('remotes/origin/')) {
          return branch.substring(15);
        }
        return branch;
      })
      .filter((branch, index, self) => self.indexOf(branch) === index);
    
    res.json({ branches });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

// Checkout branch
router.post('/checkout', async (req, res) => {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    const { stdout } = await execAsync(`git checkout "${branch}"`, { cwd: projectPath });
    res.json({ success: true, output: stdout });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new branch
router.post('/create-branch', async (req, res) => {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch name are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    const { stdout } = await execAsync(`git checkout -b "${branch}"`, { cwd: projectPath });
    res.json({ success: true, output: stdout });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent commits
router.get('/commits', async (req, res) => {
  const { project, limit = 10 } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    const { stdout } = await execAsync(
      `git log --pretty=format:'%H|%an|%ae|%ad|%s' --date=relative -n ${limit}`,
      { cwd: projectPath }
    );
    
    const commits = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, email, date, ...messageParts] = line.split('|');
        return {
          hash,
          author,
          email,
          date,
          message: messageParts.join('|'),
          stats: ''
        };
      });
    
    for (const commit of commits) {
      try {
        const { stdout: stats } = await execAsync(
          `git show --stat --format='' ${commit.hash}`,
          { cwd: projectPath }
        );
        commit.stats = stats.trim().split('\n').pop() || '';
      } catch (error) {
        commit.stats = '';
      }
    }
    
    res.json({ commits });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

// Get diff for a specific commit
router.get('/commit-diff', async (req, res) => {
  const { project, commit } = req.query;
  
  if (!project || !commit) {
    return res.status(400).json({ error: 'Project name and commit hash are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project as string);
    const { stdout } = await execAsync(`git show ${commit}`, { cwd: projectPath });
    res.json({ diff: stdout });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

// Generate commit message based on staged changes
router.post('/generate-commit-message', async (req, res) => {
  const { project, files } = req.body;
  
  if (!project || !files || files.length === 0) {
    return res.status(400).json({ error: 'Project name and files are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    let combinedDiff = '';
    for (const file of files) {
      try {
        const { stdout } = await execAsync(`git diff HEAD -- "${file}"`, { cwd: projectPath });
        if (stdout) combinedDiff += `\n--- ${file} ---\n${stdout}`;
      } catch (error) {}
    }
    
    const message = generateSimpleCommitMessage(files, combinedDiff);
    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remote status, fetch, pull, push (smart remote detection)
router.get('/remote-status', async (req, res) => {
  const { project } = req.query;
  if (!project) return res.status(400).json({ error: 'Project name is required' });

  try {
    const projectPath = await getActualProjectPath(project as string);
    await validateGitRepository(projectPath);
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const branch = currentBranch.trim();

    let trackingBranch;
    let remoteName;
    try {
      const { stdout } = await execAsync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { cwd: projectPath });
      trackingBranch = stdout.trim();
      remoteName = trackingBranch.split('/')[0];
    } catch (error) {
      return res.json({ hasRemote: false, branch, message: 'No remote tracking branch configured' });
    }

    const { stdout: countOutput } = await execAsync(`git rev-list --count --left-right ${trackingBranch}...HEAD`, { cwd: projectPath });
    const [behind, ahead] = countOutput.trim().split('\t').map(Number);

    res.json({
      hasRemote: true,
      branch,
      remoteBranch: trackingBranch,
      remoteName,
      ahead: ahead || 0,
      behind: behind || 0,
      isUpToDate: ahead === 0 && behind === 0
    });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

router.post('/fetch', async (req, res) => {
  const { project } = req.body;
  if (!project) return res.status(400).json({ error: 'Project name is required' });

  try {
    const projectPath = await getActualProjectPath(project);
    await validateGitRepository(projectPath);
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const branch = currentBranch.trim();

    let remoteName = 'origin';
    try {
      const { stdout } = await execAsync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { cwd: projectPath });
      remoteName = stdout.trim().split('/')[0];
    } catch (error) {}

    const { stdout } = await execAsync(`git fetch ${remoteName}`, { cwd: projectPath });
    res.json({ success: true, output: stdout || 'Fetch completed successfully', remoteName });
  } catch (error: any) {
    res.status(500).json({ error: 'Fetch failed', details: error.message });
  }
});

router.post('/pull', async (req, res) => {
  const { project } = req.body;
  if (!project) return res.status(400).json({ error: 'Project name is required' });

  try {
    const projectPath = await getActualProjectPath(project);
    await validateGitRepository(projectPath);
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const branch = currentBranch.trim();

    let remoteName = 'origin';
    let remoteBranch = branch;
    try {
      const { stdout } = await execAsync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { cwd: projectPath });
      const tracking = stdout.trim();
      remoteName = tracking.split('/')[0];
      remoteBranch = tracking.split('/').slice(1).join('/');
    } catch (error) {}

    const { stdout } = await execAsync(`git pull ${remoteName} ${remoteBranch}`, { cwd: projectPath });
    res.json({ success: true, output: stdout || 'Pull completed successfully', remoteName, remoteBranch });
  } catch (error: any) {
    res.status(500).json({ error: 'Pull failed', details: error.message });
  }
});

router.post('/push', async (req, res) => {
  const { project } = req.body;
  if (!project) return res.status(400).json({ error: 'Project name is required' });

  try {
    const projectPath = await getActualProjectPath(project);
    await validateGitRepository(projectPath);
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    const branch = currentBranch.trim();

    let remoteName = 'origin';
    let remoteBranch = branch;
    try {
      const { stdout } = await execAsync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { cwd: projectPath });
      const tracking = stdout.trim();
      remoteName = tracking.split('/')[0];
      remoteBranch = tracking.split('/').slice(1).join('/');
    } catch (error) {}

    const { stdout } = await execAsync(`git push ${remoteName} ${remoteBranch}`, { cwd: projectPath });
    res.json({ success: true, output: stdout || 'Push completed successfully', remoteName, remoteBranch });
  } catch (error: any) {
    res.status(500).json({ error: 'Push failed', details: error.message });
  }
});

router.post('/discard', async (req, res) => {
  const { project, file } = req.body;
  if (!project || !file) return res.status(400).json({ error: 'Project name and file path are required' });

  try {
    const projectPath = await getActualProjectPath(project);
    await validateGitRepository(projectPath);
    const { stdout: statusOutput } = await execAsync(`git status --porcelain "${file}"`, { cwd: projectPath });
    
    if (!statusOutput.trim()) return res.status(400).json({ error: 'No changes to discard' });
    const status = statusOutput.substring(0, 2);
    
    if (status === '??') {
      await fs.unlink(path.join(projectPath, file));
    } else if (status.includes('M') || status.includes('D')) {
      await execAsync(`git restore "${file}"`, { cwd: projectPath });
    } else if (status.includes('A')) {
      await execAsync(`git reset HEAD "${file}"`, { cwd: projectPath });
    }
    
    res.json({ success: true, message: `Discarded ${file}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
