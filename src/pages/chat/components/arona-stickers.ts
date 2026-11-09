export const aronaStickers = [
  {
    gif: new URL("../../../assets/arona-stickers/smug.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/smug.png", import.meta.url).href,
  },
  {
    gif: new URL("../../../assets/arona-stickers/wow.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/wow.png", import.meta.url).href,
  },
  {
    gif: new URL("../../../assets/arona-stickers/shy.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/shy.png", import.meta.url).href,
  },
  {
    gif: new URL("../../../assets/arona-stickers/angry.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/angry.png", import.meta.url).href,
  },
  {
    gif: new URL("../../../assets/arona-stickers/puzzled.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/puzzled.png", import.meta.url).href,
  },
  {
    gif: new URL("../../../assets/arona-stickers/shocked.gif", import.meta.url).href,
    poster: new URL("../../../assets/arona-stickers/shocked.png", import.meta.url).href,
  },
] as const;

// A page-local seed varies the decoration without changing it on streaming updates.
const stickerSeed = Math.floor(Math.random() * 0x100000000);

export function aronaStickerForMessage(messageKey: string, sessionKey = "") {
  let hash = stickerSeed;
  for (const character of `${sessionKey}:${messageKey}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return aronaStickers[(hash >>> 0) % aronaStickers.length]!;
}
