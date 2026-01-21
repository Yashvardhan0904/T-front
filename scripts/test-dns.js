const dns = require('dns');

const host = 'cluster0.zv6sffi.mongodb.net';
const srv = '_mongodb._tcp.' + host;

console.log(`Checking SRV record for: ${srv}`);
dns.resolveSrv(srv, (err, addresses) => {
    if (err) {
        console.error('❌ SRV Resolution Failed:', err.message);
        console.log('--- Attempting direct A record lookup for host ---');
        dns.lookup(host, (err2, address) => {
            if (err2) {
                console.error('❌ Host Lookup Failed:', err2.message);
            } else {
                console.log('✅ Host Lookup Success:', address);
            }
        });
    } else {
        console.log('✅ SRV Resolution Success:');
        console.log(addresses);
    }
});

// Test probable shard host
const shard = 'cluster0-shard-00-00.zv6sffi.mongodb.net';
console.log(`\nChecking shard resolution for: ${shard}`);
dns.lookup(shard, (err, address) => {
    if (err) {
        console.error('❌ Shard Lookup Failed:', err.message);
    } else {
        console.log('✅ Shard Lookup Success:', address);
    }
});
