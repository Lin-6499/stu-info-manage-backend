import pool from "./Connection.js";
export const baseDB={
    query(sql,params){
        return pool.execute(sql,params);
    },
    async getID(userName){
        console.log('用户名',userName)
        const [rows] = await this.query(
            `SELECT user_id FROM user WHERE username = ?`,
            [userName]
        )
        return rows.length > 0 ? rows[0].user_id : null;
    },
    // 获取用户密码
    async getPassword(user_id){
        const [rows] = await this.query(
            `SELECT password FROM user WHERE user_id = ?`,
            [user_id]
        )
        return rows.length>0?rows[0].password : null
    },
    async getUserRole(user_id){
        const [rows] = await this.query(
            `SELECT role_type
            FROM user WHERE user_id = ?`,
            [user_id]
        )
        return rows.length > 0 ? rows[0].role_type : null
    }
}
export const studentsDB = {
    // 通用查询
    query(sql,params){
        return pool.execute(sql,params);
    },
    // 获取用户信息
    async getStuUserInfo(user_id){
        const [rows] = await this.query(
            `SELECT
              u.id, u.username, u.real_name, u.phone, u.avatar, u.role_type,
              st.*,
              c.counselor_id,u.age,u.gender,u.id_card_type,u.id_card_no,u.political_status,
              u.birth_date,u.nation,u.remark
            FROM user u
            LEFT JOIN students st ON st.user_id = u.user_id
            LEFT JOIN classes c ON c.name = st.class_name
            WHERE u.user_id = ?;`,
            [user_id]
        )
        return rows.length>0?rows[0]:null
    },
    // 获取学生周次课表
    async getStudentSchedule(weekTime,student_id,semester){
        const [rows] = await this.query(
            `SELECT
                 c.name AS course_name,
                 teacher_user.real_name AS teacher_name,
                 s.location,
                 s.day_of_week,
                 s.period_start,
                 s.period_end,
                 s.semester
             FROM
                 schedule s
                     JOIN
                 courses c ON s.course_id = c.id
                     JOIN
                 students stu ON s.class_name = stu.class_name
                     JOIN
                 user u ON stu.user_id = u.user_id
                     JOIN
                 user AS teacher_user ON s.teacher_id = teacher_user.id
             WHERE
                 u.user_id = ? AND ? BETWEEN s.week_start AND s.week_end AND s.semester = ?
             ORDER BY
                 s.day_of_week, s.period_start;`,
            [student_id,weekTime,semester]
        )
        console.log(rows)
        return rows.length>0?rows:null;
    },
    // 辅导员信息
    async getCounselorInfo(className){
        const [rows] = await this.query(
            `SELECT DISTINCT
                u.real_name AS counselor_name,
                u.phone AS counselor_phone
                FROM students AS s
                JOIN classes AS c ON s.class_name = c.name
                JOIN user AS u ON c.counselor_id = u.id
                WHERE s.class_name = ?;`,
            [className]
        )
        console.log('row',rows[0])
        return rows.length>0?rows[0]:null
    },
    // 所有成绩查询
    async getGradesInquiry(student_id){
        const [rows] = await this.query(
            `SELECT
                v.semester,
                v.course_name,
                c.credits AS course_credits,
                v.score,
                v.nature,
                v.earned_credit
                FROM
                v_grades_with_credits AS v
                JOIN
                courses AS c ON v.course_id = c.id
                WHERE
                v.student_id = ?
                ORDER BY
                v.semester, v.course_name;`,
            [student_id]
        )
        return rows.length>0?rows:null
    },
    // 获取所有课程名
    async getCourseList(class_name){
        const [rows] = await this.query(
            `SELECT DISTINCT
                 c.name AS course_name
             FROM
                 schedule AS s
                     JOIN
                 courses AS c ON s.course_id = c.id
             WHERE
                 s.class_name = ?;`,
            [class_name]
        )
        return rows.length>0?rows:null
    },
    async addDifficultyApply(student_id,proof_files,family_income,description){
        const [rows] = await this.query(
            `INSERT INTO \`difficulty_apps\`
             (\`student_id\`,
              \`proof_files\`,
              \`family_income\`,
              \`description\`,
              \`reviewer_id\` -- 这个字段将由子查询自动填充
             )
             SELECT ?,             -- 第1个问号: 学生的 user_id
                    ?,             -- 第2个问号：文件路径
                    ?,             -- 第3个问号: 家庭收入
                    ?,             -- 第4个问号: 申请理由
                    c.counselor_id -- 这里自动查出辅导员ID
             FROM students AS s
                      JOIN
                  classes AS c ON s.class_name = c.name
             WHERE s.user_id = ?; -- 第4个问号: 再次填入学生的 user_id`,
            [student_id,proof_files,family_income,description,student_id],
        )
        return rows.affectedRows>0?rows.affectedRows:null
    },
    async addRecordsApply(records){
        const {student_id,content,start_at,end_at,type,     is_at_school,address} = records
        const [rows] = await this.query(
            `INSERT INTO records (student_id,content,start_at,end_at,type,     is_at_school,address)
                 VALUES (?,?,?,?,?,?,?);`,
            [student_id,content,start_at,end_at,type,is_at_school,address],
        )
        return rows.affectedRows>0?rows.affectedRows:null
    },
    async selectRecord(student_id){
        const [rows] = await this.query(
            `SELECT * FROM records WHERE student_id = ?`,
            [student_id]
        )
        return rows.length>0?rows[0]:null
    },
    async selectDiffcult(student_id){
        const [rows] = await this.query(
            `SELECT * FROM difficulty_apps WHERE student_id = ?`,
            [student_id]
        )
        return rows.length>0?rows[0]:null
    },
    async deleteRecord(student_id){
        const [rows] = await this.query(
            `DELETE FROM records WHERE student_id = ?;`,
            [student_id]
        )
        return rows.affectedRows>0?rows.affectedRows:null
    }
}
export const counselorDB = {
    query(sql,params){
        return pool.query(sql,params);
    },
    // 获取用户信息
    async getCslUserInfo(user_id){
        const [rows] = await this.query(
            `SELECT
              u.id, u.username, u.real_name, u.phone, u.avatar, u.role_type,
              u.age,u.gender,u.id_card_type,u.id_card_no,u.political_status,
              u.birth_date,u.nation,u.remark,u.user_id
            FROM user u
            WHERE u.user_id = ?;`,
            [user_id]
        )
        return rows.length>0?rows[0]:null
    },
    async getCounselorSchedule(counselor_id,semester,weekTime){
        const [rows] = await this.query(
            `SELECT
                 sc.semester,
                 sc.day_of_week,
                 sc.period_start,
                 sc.period_end,
                 co.name AS course_name,
                 sc.class_name,
                 sc.location,
                 sc.week_start,
                 sc.week_end,
                 u.real_name AS teacher_name
             FROM
                 schedule AS sc
                     JOIN
                 user AS u ON sc.teacher_id = u.id
                     JOIN
                 courses AS co ON sc.course_id = co.id
             WHERE
                 u.user_id = ? AND sc.semester = ? AND ? BETWEEN sc.week_start AND sc.week_end
             ORDER BY
                 sc.day_of_week, sc.period_start;`,
            [counselor_id,semester,weekTime]
        )
        return rows.length>0?rows:null
    },
    async getDifficultyList(counselor_id){
        const [rows] = await this.query(
            `SELECT DISTINCT u.real_name,u.gender,u.id_card_no,u.phone,u.birth_date, d.status, d.updated_at, d.student_id,d.family_income,d.description,d.proof_files,d.created_at,d.updated_at
                FROM difficulty_apps AS d
                JOIN user AS u ON d.student_id = u.user_id
                WHERE d.reviewer_id = ?;`,
            [counselor_id]
        )
        console.log('row', rows)
        return rows.length>0?rows:null
    },
    async alertDifficultyApply(status,reviewer_at,student_id){
        const [rows] = await this.query(
            `UPDATE difficulty_apps
                 SET status = ?,reviewed_at = ?
                 WHERE student_id = ?;
                `, [status,reviewer_at,student_id]
        )
        return rows.affectedRows>0?rows.affectedRows:null
    },
    async getRecordsList(user_id){
        const [rows] = await this.query(
            `SELECT
                u.real_name,   
                r.student_id,
                r.apply_at,
                r.start_at,
                r.end_at,
                r.content,      
                r.status,       
                r.type          
                FROM
                teachers AS t
                JOIN
                classes AS c ON t.user_id = c.counselor_id
                JOIN
                students AS s ON c.name = s.class_name
                JOIN
                user AS u ON s.user_id = u.user_id
                JOIN
                records AS r ON s.user_id = r.student_id
                WHERE    t.user_id = ?;`,
            [user_id]
        )
        return rows.length>0?rows:null
    },
    async alertRecordsStatus(student_id,new_status){
        const [rows] = await this.query(
            `UPDATE records
                 SET status = ?
                 WHERE student_id = ?;`,
            [new_status,student_id]
        )
        return rows.affectedRows>0?rows.affectedRows:null
    }
}