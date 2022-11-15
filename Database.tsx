import * as SQLite from 'expo-sqlite';
import ToDo from "./Todo";
import {WebSQLDatabase} from "expo-sqlite";

/**
 * build query with filters and order
 * @param query base query start with select and end with from (completed)
 * @param {{}} filters each key and value is interpreted (strict equals)
 * @param {{order: 'DESC' | 'ASC', key: string}} orderBy order by key with order define in order filed
 * @returns {string}
 */
const buildQuery = (query: string, filters: any, orderBy: {order: 'DESC' | 'ASC', key: string}) =>
{
    if(filters && filters.length > 0)
    {
        query += ' WHERE ';

        for (const filtersKey in filters) {
            query += filtersKey + ' = ' + (filters[filtersKey] ? filters[filtersKey] : 'NULL').toString() + ' AND ';
        }

        query = query.substring(0, query.length - 4);
    }

    if(orderBy && orderBy.key)
    {
        query += ' ORDER BY ' + orderBy.key + (orderBy.order === 'DESC' ? 'DESC' : 'ASC');
    }

    return query + ';';
}

const convertToSql = (value: any) =>
{
    switch (typeof value)
    {
        case "string": return `"${value}"`;
        case "number": return value;
        case "boolean": return value ? 1 : 0;
        case "bigint": return value;
        case "object": return new Date(value).getTime()
    }
}

let db: WebSQLDatabase;
try
{
    db = SQLite.openDatabase("todolist.db");
}
catch (e)
{
    console.log("error in init")
    console.error(e);
}

const database = function()
{
    return new Promise((resolve, reject) =>
    {
        try {
            const createTable = `CREATE TABLE IF NOT EXISTS Todos(
            title TEXT NOT NULL,
            text TEXT NOT NULL,
            state BIT NOT NULL,
            date DATETIME NOT NULL
        );`

            db.transaction(tx =>
            {
                tx.executeSql(createTable, [], (transaction, resultSet) =>
                {
                    resolve(true);
                },
                (transaction, error) =>
                {
                    console.error(error);
                    reject(error);

                    return !!error.message;
                });
            },
            error => {
                console.error(error);
                reject(error);
            });
        }
        catch (e)
        {
            console.error(e);
        }
    });
}

/**
 * get list of todos with filters
 * @param filters each key and value is interpreted (strict equals)
 * @param orderBy order by value with ASC or DESC
 */
database.getTodos = function(filters: any = {}, orderBy: {order: 'DESC' | 'ASC', key: string} = {key: '', order: 'ASC'})
{
    return new Promise<ToDo[]>((resolve, reject) =>
    {
        let query = buildQuery('SELECT * from Todos', filters, orderBy);

        db.transaction(tx =>
        {
            const res: ToDo[] = [];

            tx.executeSql(query, [], (transaction, resultSet) =>
            {
                const rows = resultSet.rows;

                for (let i = 0; i < rows.length; i++)
                {
                    const result: any = rows.item(i);

                    res.push({
                        title: result.title,
                        text: result.text,
                        state: result.state == '1',
                        date: new Date(parseInt(result.date))
                    });
                }

                console.log(res);
                resolve(res);
            },
            (transaction, error) =>
            {
                console.error(error);
                reject(error);

                return !!error.message;
            });

        }, error => {
            console.error(error);
            reject(error);
        });
    });
};

database.addTodo = function (todo: ToDo)
{
    return new Promise<number>((resolve, reject) =>
    {
        const objKeys   = Object.keys(todo);
        const objValues = Object.values(todo);

        const insert = `INSERT INTO Todos(${objKeys.join(", ")}) VALUES (${objValues.map(val => convertToSql(val)).join(", ")});`;

        db.transaction(tr =>
        {
            tr.executeSql(insert, [], (transaction, resultSet) =>
            {
                resolve(resultSet.rowsAffected);
            },
            (transaction, error) =>
            {
                console.error(error);
                reject(error);

                return !!error.message;
            });
        },
        error =>
        {
            console.log(error);
            reject(error);
        });
    });
};

database.removeTodo = function(todo: ToDo)
{
    return new Promise((resolve, reject) =>
    {
        db.transaction(tr =>
        {
            tr.executeSql(`DELETE FROM Todos WHERE title = "${todo.title}"`, [], (transaction, resultSet) =>
            {
                resolve(resultSet.rowsAffected);
            },
            (transaction, error) =>
            {
                console.log(error);
                reject(error);

                return !!error.message;
            });
        },
        error =>
        {
            console.log(error);
            reject(error);
        });
    });
}

export default database;