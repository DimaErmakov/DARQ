import QRCode from "qrcode";

const publicUrl = "https://marisha-impending-insolubly.ngrok-free.dev/redirect";

(async () => {
  await QRCode.toFile("redirect_qr.png", publicUrl, {
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  console.log("Permanent QR code generated for: " + publicUrl);
})();
