const next = require('next');
const http = require('http');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleNextRequests = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = new http.Server((req, res) => {
    // Add assetPrefix support based on the hostname
    if (req.headers.host === 'my-app.com') {
      app.setAssetPrefix('http://cdn.com/myapp');
    } else {
      app.setAssetPrefix('');
    }

    handleNextRequests(req, res);
  });

  server.listen(port, err => {
    if (err) {
      throw err;
    }

    console.log(
      process.env.PORT
        ? `App running on port ${port}`
        : `App running at http://localhost:${port}`
    );
  });
});
