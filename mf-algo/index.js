process.stdin.on('data', (chunk) => {
  const buf1 = Buffer.from('this is a tést\n');

  if (chunk !== null) {
    process.stdout.write(buf1);
  }
});