import { defineConfig } from 'vite';

// GitHub Pages serves this repository under /draft-portfolio/.
// Keep local development at the domain root so localhost URLs stay unchanged.
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isGitHubActions ? '/draft-portfolio/' : '/',
});
