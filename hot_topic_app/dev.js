const app = require('./server');
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Local server is running at http://127.0.0.1:${PORT}`);
});