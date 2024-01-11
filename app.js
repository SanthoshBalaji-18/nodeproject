const { Client } = require('pg');
const express = require('express');

const app = express();
const port = 3000;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'ImAsher@18',
    port: 5432
});

client.connect();

app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT name FROM classlist');
        const rows = result.rows;
        const subresult = await client.query('SELECT name FROM subjectlist');
        const subrows = subresult.rows;

        res.send(`<html>
            <body>
                <form method="post" action="/submit">
                    <label for="classDropdown">Class:</label>
                    <select id="classDropdown" name="classDropdown" multiple>
                        ${rows.map(row => `<option value="${row.name}">${row.name}</option>`).join('')}
                    </select>
                    <label for="subjectDropdown">Subject:</label>
                    <select id="subjectDropdown" name="subjectDropdown" multiple>
                        ${subrows.map(row => `<option value="${row.name}">${row.name}</option>`).join('')}
                    </select>
                    <button type="submit">Submit</button>
                </form>
            </body>
        </html>`);
    } catch (error) {
        console.error('Error retrieving data from PostgreSQL:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/submit', async (req, res) => {
try {
      const { classDropdown, subjectDropdown } = req.body;
      if (Array.isArray(classDropdown)) {
        for (const className of classDropdown) {
            if (Array.isArray(subjectDropdown)) {
                for (const subjectName of subjectDropdown) {
                    await client.query('INSERT INTO CLASSTODAY (classname, subjectname) VALUES ($1, $2)', [className, subjectName]);
                }
            } else {
                await client.query('INSERT INTO CLASSTODAY (classname, subjectname) VALUES ($1, $2)', [className, subjectDropdown]);
            }
        }
    } else {
        if (Array.isArray(subjectDropdown)) {
            for (const subjectName of subjectDropdown) {
                await client.query('INSERT INTO CLASSTODAY (classname, subjectname) VALUES ($1, $2)', [classDropdown, subjectName]);
            }
        } else {
            await client.query('INSERT INTO CLASSTODAY (classname, subjectname) VALUES ($1, $2)', [classDropdown, subjectDropdown]);
        }
    }

    res.send('Form submitted successfully!');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
