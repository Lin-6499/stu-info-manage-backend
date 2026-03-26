/**
 * 将原始课程列表转换为课表表格格式
 * @param {Array} courses - 原始课程数组
 * @returns {Array} 转换后的课表行数组
 */
export function transformToScheduleTable(courses) {
    if (!Array.isArray(courses)) {
        courses = [];
    }
    const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const MAX_PERIOD = 12; // 假设最多到第12节课

    // 1. 初始化所有节次段（1-2, 3-4, ..., 11-12）
    const tableMap = {};
    for (let start = 1; start <= MAX_PERIOD; start += 2) {
        const end = Math.min(start + 1, MAX_PERIOD);
        const key = `${start}-${end}`;
        tableMap[key] = {
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: '',
            Sunday: ''
        };
    }

    // 2. 遍历每门课程，填入对应位置
    courses.forEach(course => {
        const { course_name, teacher_name, location, day_of_week, period_start, period_end } = course;
        const displayText = `${course_name}\n${teacher_name}\n${location}`;
        const dayIndex = day_of_week - 1; // 1→0 (Monday)

        if (dayIndex < 0 || dayIndex >= WEEKDAYS.length) return;
        const targetDay = WEEKDAYS[dayIndex];

        // 检查该课程覆盖哪些“节次段”
        for (const segment in tableMap) {
            const [segStart, segEnd] = segment.split('-').map(Number);

            // 判断时间是否重叠
            if (!(period_end < segStart || period_start > segEnd)) {
                const cell = tableMap[segment][targetDay];
                tableMap[segment][targetDay] = cell ? `${cell}\n---\n${displayText}` : displayText;
            }
        }
    });

    // 3. 转为数组并按节次排序
    return Object.entries(tableMap)
        .map(([segment, days]) => ({
            period: `第${segment}节`,
            ...days
        }))
        .sort((a, b) => {
            const aNum = parseInt(a.period.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.period.match(/\d+/)?.[0] || '0');
            return aNum - bNum;
        });
}
