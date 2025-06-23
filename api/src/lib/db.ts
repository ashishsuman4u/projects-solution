import { Pool, PoolClient } from 'pg';

export default class DB {
  pool: Pool;
  client: PoolClient;
  constructor(private username: string, private password: string) {
    this.pool = new Pool({
      user: this.username,
      host: process.env.RDS_ENDPOINT,
      database: process.env.DB_NAME,
      password: this.password,
      port: 5432,
    });
  }

  connect = async () => {
    this.client = await this.pool.connect();
  };

  release = async () => {
    return this.client.release();
  };

  getUserByEmail = async (email: string) => {
    return this.client.query('SELECT tenant_id, name, email FROM users WHERE email = $1', [email]);
  };

  getUserRoleByEmail = async (email: string) => {
    return this.client.query(
      `SELECT tenant_id, r.name as role FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email =  $1`,
      [email]
    );
  };

  getRole = async (role: string) => {
    return this.client.query(
      `SELECT role_id FROM roles
       WHERE name =  $1`,
      [role]
    );
  };

  addUser = async (email: string, tenantId: string, roleId: number, name: string) => {
    return this.client.query('INSERT INTO users (email, tenant_id, role_id, name) VALUES ($1, $2, $3, $4)', [
      email,
      tenantId,
      roleId,
      name,
    ]);
  };

  addProject = async (tenantId: string, name: string, description: string) => {
    return this.client.query(
      'INSERT INTO projects (tenant_id, name, description) VALUES ($1, $2, $3) RETURNING project_id',
      [tenantId, name, description]
    );
  };
}
