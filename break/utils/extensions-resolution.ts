export const getHeaderContentTypeOf = function(url: string): string[] {
  let matched : RegExpMatchArray | null = url.match(/\.([^\s]*)+$/);
  let result: any = {
    txt: 'text/plain',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    html: 'application/xml+html',
    css: 'text/css',
    js: 'text/javascript',
    webp: 'image/webp',
    midi: 'audio/midi',
    mpeg: 'audio/mpeg',
    webm: 'audio/webm',
    ogg: 'audio/ogg',
    wav: 'audio/wave, audio/wav, audio/x-wav, audio/x-pn-wav'
  };
  if (matched) {
    let extension: string = matched[1] || 'txt';
    let contentType : string = result[extension] || result.txt;
    return ['Content-Type', contentType];
  }
  return result.txt;
}