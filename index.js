const mysql = require('mysql')
const express = require('express');
const cookieParser   = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser("abdasii"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     
    extended: true
})); 

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'admin',
    password        : 'password',
    database        : 'owasp'
});


app.get('/', (req, res) => {
    if (!Object.keys(req.signedCookies).length) {
        res.send(
            `<h1>Hello, Sir!</h1>
            <br><br>
            <button id="signIn">Sign in</button> 
            <button id="register">Register</button> 
            <script>
                document.getElementById("signIn").onclick = function () {
                    location.href = "/signIn";
                }
                document.getElementById("register").onclick = function () {
                    location.href = "/register"
                }
            </script>
            `
        );
        return;
    } 

    let body;

    body = `
        <h1>Hello, ${req.signedCookies.account}!</h1>
        <br><br>
    `;

    body += `<button id="signOut">Sign out</button>`;
    body += `<button id="comment">Comment</button>`;

    body += `
        <script>
            document.getElementById("signOut").onclick = function () {
                location.href = "/signOut";
            };
            document.getElementById("comment").onclick = function () {
                location.href = "/comment";
            };
        </script>  
    `;

    res.send(body);
});

app.get('/register', (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form action="/register" method="POST">
            
            <label for="account">Account</label>
            <input id="account" name="account" type="text">
            <br>

            <label for="password">Password</label>
            <input id="password" name="password" type="text">
            <br>

            <input type="submit">
        </form>
    `);
});

app.get('/signIn', (req, res) => {
    res.send(`
        <h1>Sign In</h1>
        <form action="/signIn" method="POST">
            
            <label for="account">Account</label>
            <input id="account" name="account" type="text">
            <br>

            <label for="password">Password</label>
            <input id="password" name="password" type="text">
            <br>

            <input type="submit">
        </form>
    `);
});

app.post('/register', (req, res)=>{
    pool.getConnection(function(err, connection){
        if (err) {
            res.send(`<h1>Error</h1>`);
            return;
        }

        let query = `
            INSERT INTO accounts (account, password)
            VALUES ("${req.body.account}", "${req.body.password}")
        `;
        connection.query(query, function (error) {
            connection.release();
            res.redirect("/");
        })
    })
})

app.post('/signIn', (req, res)=>{
    pool.getConnection(function(err, connection){
        if (err) {
            res.send(`<h1>Error</h1>`);
            return;
        }

        let query = `
            SELECT * FROM accounts WHERE account = "${req.body.account}" AND password = "${req.body.password}"
        `;
        connection.query(query, function (error, results) {
            connection.release();

            if (!results.length) {
                res.send(`account not exists or invalid password`)
                return;
            }

            res.cookie("account", req.body.cookie, {signed: true})
                .redirect("/");
        })
    })
})

app.get("/signOut", (req, res) => {
    res.clearCookie("account");
});

app.listen(3000, (err) => {
    console.log('start successfully')
})