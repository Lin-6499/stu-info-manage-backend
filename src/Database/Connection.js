import mysql from "mysql2/promise";

import {loadEnvFrom} from "../middle/loadEnv.js";

loadEnvFrom(import.meta.url,'../../.env.server')



console.log('connection started',process.env.DB_HOST);
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool