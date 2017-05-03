const PACKET_SIZE_HEADER = 2;

process.stdin.on('data', (chunk) => {
  var tmpString = Buffer.from(chunk).slice(PACKET_SIZE_HEADER, chunk.length).toString();

  tmpString = tmpString + " from node";

  const buf1 = Buffer.from(tmpString);

  writeBufferSize(buf1);
  writeBuffer(buf1);

});

function writeBufferSize(buffer) {

  const bufSizePacket = Buffer.alloc(PACKET_SIZE_HEADER);
  const size = buffer.length;

  if(PACKET_SIZE_HEADER == 1) {
    bufSizePacket.write8(size);
  } else if(PACKET_SIZE_HEADER == 2) {
    bufSizePacket.writeInt16BE(size);
  } else if(PACKET_SIZE_HEADER == 4) {
    bufSizePacket.writeInt32BE(size);
  }

  process.stdout.write(bufSizePacket);
}

function writeBuffer(buffer) {
  process.stdout.write(buffer);
}
