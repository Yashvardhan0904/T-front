const net = require('net');

const hosts = [
    'cluster0-shard-00-00.p7mgu.mongodb.net',
    'cluster0-shard-00-01.p7mgu.mongodb.net',
    'cluster0-shard-00-02.p7mgu.mongodb.net'
];
const port = 27017;

console.log(`Checking connectivity to MongoDB shards on port ${port}...\n`);

hosts.forEach(host => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`✅ SUCCESS: Connected to ${host}:${port} in ${Date.now() - start}ms`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`❌ TIMEOUT: Could not reach ${host}:${port} (ISP or Firewall might be blocking port 27017)`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`❌ ERROR: Failed to connect to ${host}:${port} - ${err.message}`);
    });

    socket.connect(port, host);
});
