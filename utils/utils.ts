//转义特殊字符
export function translateSpecialChar(str: string, mode: 'read' | 'write') {
    if (mode === 'write') {
        //sql 写入
        str = str.replace(/'/g, '$@');
        // str = str.replace('\r', 'CHAR(10)');
        // str = str.replace('\n', 'CHAR(13)');
    } else {
        str = str.replace(/\$@/g, "'");
        // str = str.replace(/CHAR(10)/g, '\r');
        // str = str.replace(/CHAR(13)/g, '\n');
    }
    return str;
}
//转换对象 简单
export function tranformToValues(data: { [key: string]: any }) {
    const items = [];
    for (const prop in data) {
        const value = typeof data[prop] === 'string' ? `"${data[prop]}"` : `${data[prop]}`;//字符串 必须包裹在“”之间
        items.push(`${value || 'NULL'}`);
    }
    return items.join(',');
}