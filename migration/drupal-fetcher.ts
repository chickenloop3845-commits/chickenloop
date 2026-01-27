/**
 * Drupal Data Fetcher
 *
 * Fetches data from Drupal 7 site via Drush and SSH
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { MIGRATION_CONFIG } from './config';

const execAsync = promisify(exec);

export class DrupalFetcher {
  private sshCommand: string;

  constructor() {
    const { siteRoot } = MIGRATION_CONFIG.drupal;
    // Use SSH config host 'chickenloop' instead of individual connection params
    this.sshCommand = `ssh chickenloop "cd ${siteRoot} && drush"`;
  }

  /**
   * Execute a Drush SQL query
   */
  async sqlQuery(query: string): Promise<string> {
    // Use single quotes for the SQL query to avoid escaping issues
    const escapedQuery = query.replace(/'/g, "'\\''");
    const { siteRoot } = MIGRATION_CONFIG.drupal;
    const command = `ssh chickenloop "cd ${siteRoot} && drush sqlq '${escapedQuery}'"`;

    try {
      const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
      if (stderr && !stderr.includes('continue')) {
        console.warn('SQL Query Warning:', stderr);
      }
      return stdout;
    } catch (error: any) {
      console.error('SQL Query Error:', error.message);
      throw error;
    }
  }

  /**
   * Execute a Drush eval PHP command
   */
  async evalPhp(phpCode: string): Promise<string> {
    // Write PHP code to a temp file to avoid quote escaping issues
    const { siteRoot } = MIGRATION_CONFIG.drupal;
    const tmpFile = `/tmp/drush_eval_${Date.now()}.php`;

    // Create temp file with PHP code
    const createFileCmd = `ssh chickenloop "cat > ${tmpFile} << 'EOFPHP'\n${phpCode}\nEOFPHP\n"`;
    await execAsync(createFileCmd);

    // Execute the temp file
    const command = `ssh chickenloop "cd ${siteRoot} && drush eval \\"\\\$(cat ${tmpFile})\\" && rm ${tmpFile}"`;

    try {
      const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
      if (stderr && !stderr.includes('continue')) {
        console.warn('Drush Eval Warning:', stderr);
      }
      return stdout;
    } catch (error: any) {
      // Try to clean up temp file even on error
      try {
        await execAsync(`ssh chickenloop "rm -f ${tmpFile}"`);
      } catch (e) {}
      console.error('Drush Eval Error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all users
   */
  async fetchUsers(): Promise<any[]> {
    console.log('📥 Fetching users from Drupal...');

    const query = `
      SELECT
        u.uid,
        u.name,
        u.mail,
        u.created,
        u.access,
        u.login,
        u.status,
        GROUP_CONCAT(DISTINCT ur.rid) as roles
      FROM users u
      LEFT JOIN users_roles ur ON u.uid = ur.uid
      WHERE u.uid > 0
      GROUP BY u.uid
      ORDER BY u.uid
    `;

    const result = await this.sqlQuery(query);
    const headers = ['uid', 'name', 'mail', 'created', 'access', 'login', 'status', 'roles'];
    return this.parseTabularDataWithHeaders(result, headers);
  }

  /**
   * Fetch all job nodes (3 types combined)
   */
  async fetchJobs(): Promise<any[]> {
    console.log('📥 Fetching jobs from Drupal...');

    const query = `
      SELECT
        n.nid,
        n.vid,
        n.type,
        n.title,
        n.uid,
        n.status,
        n.created,
        n.changed,
        nr.title as revision_title
      FROM node n
      LEFT JOIN node_revision nr ON n.vid = nr.vid
      WHERE n.type IN ('job_per_template', 'job_per_link', 'job_per_file')
      ORDER BY n.nid
    `;

    const result = await this.sqlQuery(query);
    const headers = ['nid', 'vid', 'type', 'title', 'uid', 'status', 'created', 'changed', 'revision_title'];
    return this.parseTabularDataWithHeaders(result, headers);
  }

  /**
   * Fetch field data for a specific node using SQL queries
   */
  async fetchNodeFields(nid: number): Promise<any> {
    const fields: any = {};

    // Fetch body field
    const bodyQuery = `SELECT body_value FROM field_data_body WHERE entity_id = ${nid} AND entity_type = 'node' LIMIT 1`;
    const bodyResult = await this.sqlQuery(bodyQuery);
    const bodyData = this.parseTabularDataWithHeaders(bodyResult, ['body_value']);
    fields.body = bodyData.length > 0 ? [{ value: bodyData[0].body_value }] : null;

    // Fetch email field
    const emailQuery = `SELECT field_job_email_email FROM field_data_field_job_email WHERE entity_id = ${nid} AND entity_type = 'node' LIMIT 1`;
    const emailResult = await this.sqlQuery(emailQuery);
    const emailData = this.parseTabularDataWithHeaders(emailResult, ['field_job_email_email']);
    fields.field_job_email = emailData.length > 0 ? [{ email: emailData[0].field_job_email_email }] : null;

    // Fetch location field
    const locationQuery = `SELECT field_job_location_value FROM field_data_field_job_location WHERE entity_id = ${nid} AND entity_type = 'node' LIMIT 1`;
    const locationResult = await this.sqlQuery(locationQuery);
    const locationData = this.parseTabularDataWithHeaders(locationResult, ['field_job_location_value']);
    fields.field_job_location = locationData.length > 0 ? [{ value: locationData[0].field_job_location_value }] : null;

    // Fetch organization field
    const orgQuery = `SELECT field_job_organization_value FROM field_data_field_job_organization WHERE entity_id = ${nid} AND entity_type = 'node' LIMIT 1`;
    const orgResult = await this.sqlQuery(orgQuery);
    const orgData = this.parseTabularDataWithHeaders(orgResult, ['field_job_organization_value']);
    fields.field_job_organization = orgData.length > 0 ? [{ value: orgData[0].field_job_organization_value }] : null;

    // Fetch salary field
    const salaryQuery = `SELECT field_job_salary_value FROM field_data_field_job_salary WHERE entity_id = ${nid} AND entity_type = 'node' LIMIT 1`;
    const salaryResult = await this.sqlQuery(salaryQuery);
    const salaryData = this.parseTabularDataWithHeaders(salaryResult, ['field_job_salary_value']);
    fields.field_job_salary = salaryData.length > 0 ? [{ value: salaryData[0].field_job_salary_value }] : null;

    return fields;
  }

  /**
   * Fetch taxonomy term names by TIDs
   */
  async fetchTermNames(tids: number[]): Promise<string[]> {
    if (!tids || tids.length === 0) return [];

    const query = `
      SELECT tid, name
      FROM taxonomy_term_data
      WHERE tid IN (${tids.join(',')})
    `;

    const result = await this.sqlQuery(query);
    const headers = ['tid', 'name'];
    const terms = this.parseTabularDataWithHeaders(result, headers);
    return terms.map(t => t.name);
  }

  /**
   * Fetch all profiles (resumes)
   */
  async fetchProfiles(): Promise<any[]> {
    console.log('📥 Fetching profiles (resumes) from Drupal...');

    const query = `
      SELECT
        p.pid,
        p.uid,
        p.type,
        p.created,
        p.changed
      FROM profile p
      WHERE p.type = 'resume'
      ORDER BY p.pid
    `;

    const result = await this.sqlQuery(query);
    const headers = ['pid', 'uid', 'type', 'created', 'changed'];
    return this.parseTabularDataWithHeaders(result, headers);
  }

  /**
   * Fetch all applications
   */
  async fetchApplications(): Promise<any[]> {
    console.log('📥 Fetching applications from Drupal...');

    const query = `
      SELECT
        n.nid,
        n.uid,
        n.created,
        n.changed,
        n.status
      FROM node n
      WHERE n.type = 'job_application'
      ORDER BY n.nid
    `;

    const result = await this.sqlQuery(query);
    const headers = ['nid', 'uid', 'created', 'changed', 'status'];
    return this.parseTabularDataWithHeaders(result, headers);
  }

  /**
   * Parse tabular SQL output to array of objects (when drush provides headers)
   */
  private parseTabularData(output: string): any[] {
    const lines = output.trim().split('\n');
    if (lines.length < 2) return [];

    // First line is header
    const headers = lines[0].split('\t');

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        // Convert NULL to null
        row[header] = value === 'NULL' ? null : value;
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Parse tabular SQL output with provided headers (drush sqlq doesn't return headers)
   */
  private parseTabularDataWithHeaders(output: string, headers: string[]): any[] {
    const lines = output.trim().split('\n');
    if (lines.length === 0) return [];

    // Parse data rows (no header line in output)
    const data: any[] = [];
    for (const line of lines) {
      const values = line.split('\t');
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        // Convert NULL to null
        row[header] = value === 'NULL' || value === undefined ? null : value;
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Get counts for validation
   */
  async getCounts(): Promise<any> {
    console.log('📊 Getting entity counts from Drupal...');

    const queries = {
      users: 'SELECT COUNT(*) as count FROM users WHERE uid > 0',
      jobs: "SELECT COUNT(*) as count FROM node WHERE type IN ('job_per_template', 'job_per_link', 'job_per_file')",
      profiles: "SELECT COUNT(*) as count FROM profile WHERE type = 'resume'",
      applications: "SELECT COUNT(*) as count FROM node WHERE type = 'job_application'",
    };

    const counts: any = {};

    for (const [key, query] of Object.entries(queries)) {
      const result = await this.sqlQuery(query);
      // COUNT queries return just a number, not tabular data
      counts[key] = parseInt(result.trim());
    }

    return counts;
  }
}
