const MONQADE_TEST_HTTP_PORT=3000;

const app = require("./testServer");

app.listen(MONQADE_TEST_HTTP_PORT, function() {
  console.log(`Monqade test server running on port: ${MONQADE_TEST_HTTP_PORT}`);
});
