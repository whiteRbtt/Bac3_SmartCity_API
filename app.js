const Router = require('./route/v1');
const express = require('express');
const routesVersioning = require('express-routes-versioning')();
const app = express();
const port = 3001;


const cors = require('cors');

app.use(cors());

app.use(express.json());

// 1 router par version, ce router servira pour la version 1.0.0 et aussi (1.0.1,... et autres update mineure)
app.use(routesVersioning({
    "~1.0.0" : Router
}));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
