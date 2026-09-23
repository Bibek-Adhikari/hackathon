import zlib from 'zlib';

interface ZipFileEntry {
  name: string;
  content: string | Buffer;
}

// Generates a fully valid standard ZIP archive buffer without extra dependencies
export function createZipBuffer(files: ZipFileEntry[]): Buffer {
  const fileRecords: {
    nameBuffer: Buffer;
    dataBuffer: Buffer;
    crc: number;
    compressedSize: number;
    uncompressedSize: number;
    offset: number;
  }[] = [];

  const chunks: Buffer[] = [];
  let currentOffset = 0;

  function crc32(buf: Buffer): number {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      const byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (crc ^ byte) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      }
    }
    return ~crc >>> 0;
  }

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const crc = crc32(dataBuf);
    const compressed = zlib.deflateRawSync(dataBuf);
    const uncompressedSize = dataBuf.length;
    const compressedSize = compressed.length;

    // Local file header (30 bytes + nameBuf.length)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // Flags
    localHeader.writeUInt16LE(8, 8);          // Compression: Deflate
    localHeader.writeUInt16LE(0x4a21, 10);     // Last mod time
    localHeader.writeUInt16LE(0x5c4e, 12);     // Last mod date
    localHeader.writeUInt32LE(crc, 14);        // CRC-32
    localHeader.writeUInt32LE(compressedSize, 18);   // Compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);   // Filename length
    localHeader.writeUInt16LE(0, 28);                // Extra field length

    const offset = currentOffset;
    chunks.push(localHeader, nameBuf, compressed);
    currentOffset += 30 + nameBuf.length + compressedSize;

    fileRecords.push({
      nameBuffer: nameBuf,
      dataBuffer: compressed,
      crc,
      compressedSize,
      uncompressedSize,
      offset,
    });
  }

  const centralDirStart = currentOffset;
  let centralDirSize = 0;

  for (const rec of fileRecords) {
    // Central directory header (46 bytes + nameBuffer.length)
    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
    cdHeader.writeUInt16LE(20, 4);         // Version made by
    cdHeader.writeUInt16LE(20, 6);         // Version needed
    cdHeader.writeUInt16LE(0, 8);          // Flags
    cdHeader.writeUInt16LE(8, 10);         // Compression: Deflate
    cdHeader.writeUInt16LE(0x4a21, 12);    // Last mod time
    cdHeader.writeUInt16LE(0x5c4e, 14);    // Last mod date
    cdHeader.writeUInt32LE(rec.crc, 16);   // CRC-32
    cdHeader.writeUInt32LE(rec.compressedSize, 20);
    cdHeader.writeUInt32LE(rec.uncompressedSize, 24);
    cdHeader.writeUInt16LE(rec.nameBuffer.length, 28);
    cdHeader.writeUInt16LE(0, 30);         // Extra field length
    cdHeader.writeUInt16LE(0, 32);         // File comment length
    cdHeader.writeUInt16LE(0, 34);         // Disk number start
    cdHeader.writeUInt16LE(0, 36);         // Internal file attributes
    cdHeader.writeUInt32LE(0x81a40000, 38);// External file attributes (regular file -rw-r--r--)
    cdHeader.writeUInt32LE(rec.offset, 42);// Relative offset of local header

    chunks.push(cdHeader, rec.nameBuffer);
    centralDirSize += 46 + rec.nameBuffer.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4);          // Disk number
  eocd.writeUInt16LE(0, 6);          // Start disk
  eocd.writeUInt16LE(fileRecords.length, 8);  // Entries on this disk
  eocd.writeUInt16LE(fileRecords.length, 10); // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);     // Size of central dir
  eocd.writeUInt32LE(centralDirStart, 16);    // Offset of central dir
  eocd.writeUInt16LE(0, 20);                 // Comment length

  chunks.push(eocd);
  return Buffer.concat(chunks);
}
