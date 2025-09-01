import 'dotenv/config';
import axios from 'axios';
import fs, { fsync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;
const GITLAB_API_URL = process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4';
const PERIOD_DAYS = parseInt(process.env.PERIOD_DAYS || '30', 10);
const TARGET_MONTH = process.env.TARGET_MONTH; // Format: YYYY-MM (e.g., "2025-07" for July 2025)
const USE_LAST_MONTH = process.env.USE_LAST_MONTH === 'true';

if (!GITLAB_TOKEN || !GITLAB_PROJECT_ID) {
  console.error('Missing GITLAB_TOKEN or GITLAB_PROJECT_ID in environment variables.');
  process.exit(1);
}

function getDateRange(): { since: string; until: string; description: string } {
  const now = new Date();
  
  if (TARGET_MONTH) {
    // Parse TARGET_MONTH (format: YYYY-MM)
    const [year, month] = TARGET_MONTH.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
    
    return {
      since: startDate.toISOString(),
      until: endDate.toISOString(),
      description: `${year}-${month.toString().padStart(2, '0')}`
    };
  } else if (USE_LAST_MONTH) {
    // Get last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return {
      since: startDate.toISOString(),
      until: endDate.toISOString(),
      description: `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`
    };
  } else {
    // Default: last N days
    const since = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000);
    
    return {
      since: since.toISOString(),
      until: now.toISOString(),
      description: `last ${PERIOD_DAYS} days`
    };
  }
}

const headers = { 'PRIVATE-TOKEN': GITLAB_TOKEN };

async function fetchPipelines(): Promise<any[]> {
  const url = `${GITLAB_API_URL}/projects/${GITLAB_PROJECT_ID}/pipelines`;
  const { since, until } = getDateRange();
  let allPipelines: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const params: any = {
      updated_after: since,
      per_page: 100,
      order_by: 'updated_at',
      sort: 'desc',
      page
    };
    
    // Add until parameter if we're using month-based filtering
    if (TARGET_MONTH || USE_LAST_MONTH) {
      params.updated_before = until;
    }
    
    const res = await axios.get(url, { headers, params });
    allPipelines = allPipelines.concat(res.data as any[]);
    hasMore = res.data.length === 100;
    page++;
  }
  
  // Save all pipelines to a file for inspection
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  return allPipelines;
}

async function fetchPipelineJobs(pipelineId: number): Promise<any[]> {
  const url = `${GITLAB_API_URL}/projects/${GITLAB_PROJECT_ID}/pipelines/${pipelineId}/jobs`;
  const res = await axios.get(url, { headers });
  return res.data;
}

async function getProductionPassedPipelines(pipelines: any[]): Promise<{ prodPassed: any[]; prodFailed: any[] }> {
  const prodPassed: any[] = [];
  const prodFailed: any[] = [];

  for (const pipeline of pipelines) {
    if (['success', 'manual'].includes(pipeline.status) && pipeline.ref === 'master') {
      // Fetch jobs for each successful pipeline
      const pipelineJobs = await fetchPipelineJobs(pipeline.id);
      
      // Check if the pipeline has a successful notify-production stage
      const hasSuccessfulNotifyProduction = pipelineJobs.some(
        job => job.stage === 'notify-production' && job.status === 'success'
      );
      
      if (hasSuccessfulNotifyProduction) {
        prodPassed.push(pipeline);
      } else {
        prodFailed.push(pipeline);
      }
    } else if (pipeline.ref === 'master') {
      prodFailed.push(pipeline);
    }
  }
  
  // Save the jobs of the first passed pipeline for inspection (if any)
  if (prodPassed.length > 0) {
    const sampleJobs = await fetchPipelineJobs(prodPassed[0].id);
    fs.writeFileSync(path.join(__dirname, '../output/pipelineJobs.json'), JSON.stringify(sampleJobs, null, 2));
  }
  
  return { prodPassed, prodFailed };
}

async function main() {
  const { description } = getDateRange();
  console.log(`Fetching pipelines for ${description}...`);
  const pipelines = await fetchPipelines();
  const { prodPassed, prodFailed } = await getProductionPassedPipelines(pipelines);

  const analytics = {
    productionPassedCount: prodPassed.length,
    productionFailedCount: prodFailed.length,
    period: description,
    generatedAt: new Date().toISOString()
  };

  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const outputPath = path.join(outputDir, 'analytics.json');
  fs.writeFileSync(outputPath, JSON.stringify(analytics, null, 2));

  const allPipelinesPath = path.join(outputDir, 'pipelines.json');
  fs.writeFileSync(allPipelinesPath, JSON.stringify({ prodPassed, prodFailed }, null, 2));

  console.log(`Analytics written to ${outputPath}`);

  console.log('Production Passed Pipelines:', prodPassed.length);
  console.log('Production Failed Pipelines:', prodFailed.length);
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});