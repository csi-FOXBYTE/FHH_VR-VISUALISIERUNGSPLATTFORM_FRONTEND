import {
  ZipReader,
  Entry,
  BlobReader,
  configure,
  WritableWriter,
} from "@zip.js/zip.js";
import sax from "sax";

configure({ useWebWorkers: false });

// FIX: Implementiert jetzt WritableWriter korrekt inkl. 'writable' Property
class SaxStreamingWriter implements WritableWriter {
  private parser: sax.SAXParser;
  private decoder: TextDecoder;

  constructor(parser: sax.SAXParser) {
    this.parser = parser;
    this.decoder = new TextDecoder("utf-8");
  }

  // Die eigentliche Verarbeitungs-Logik
  async writeUint8Array(array: Uint8Array): Promise<void> {
    const chunk = this.decoder.decode(array, { stream: true });
    this.parser.write(chunk);
  }

  // DAS HAT GEFEHLT:
  // zip.js benötigt diesen Getter, um das Interface zu erfüllen.
  // Wir erstellen einfach einen Wrapper um unsere writeUint8Array Methode.
  get writable() {
    return new WritableStream({
      write: (chunk) => this.writeUint8Array(chunk),
    });
  }
}

self.onmessage = async (event) => {
  try {
    const { file } = event.data as { file: File };

    const reader = new ZipReader(new BlobReader(file));

    let foundEntry: Entry | null = null;
    for await (const entry of reader.getEntriesGenerator()) {
      if (!entry.directory && entry.filename.toLowerCase().endsWith(".gml")) {
        foundEntry = entry;
        break;
      }
    }

    if (!foundEntry) throw new Error("No gml found!");

    const parser = sax.parser(true);
    let isInsideTarget = false;

    parser.onopentag = (node) => {
      if (node.name === "app:theme") isInsideTarget = true;
    };

    parser.ontext = (text) => {
      if (isInsideTarget) self.postMessage({ theme: text });
    };

    parser.onclosetag = (name) => {
      if (name === "app:theme") isInsideTarget = false;
    };

    await foundEntry.getData(new SaxStreamingWriter(parser));

    parser.close();
    await reader.close();
  } finally {
    self.postMessage({ status: "finished" });
  }
};
