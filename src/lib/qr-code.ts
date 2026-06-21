import QRCode from "qrcode";

export async function generateQrCodeSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    width: 200,
    margin: 2,
    color: {
      dark: "#1A1613",
      light: "#FFFFFF",
    },
  });
}

export function formatSecretForDisplay(secret: string): string {
  return secret
    .replace(/(.{4})/g, "$1 ")
    .trim()
    .toUpperCase();
}