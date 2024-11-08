import * as pg from "pg";
const { Pool } = pg.default;

const pool = new Pool({
  connectionString:
    "postgresql://postgres:Termite1%23@localhost:5432/blog-post-app",
});

export { pool };