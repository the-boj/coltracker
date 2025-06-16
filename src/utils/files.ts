export const fileToBase64 = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64String = btoa(String.fromCharCode(...uint8Array));
  return base64String;
};
