import http from 'node:http';

const PORT = process.env.PORT || '4000';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.write('Hello World');
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
