declare module 'qrcode' {
  export type QROptions = {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  };
  export function toDataURL(text: string, options?: QROptions): Promise<string>;
  const QRCode: { toDataURL: typeof toDataURL };
  export default QRCode;
}
