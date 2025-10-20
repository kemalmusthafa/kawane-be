import multer from "multer";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, fileName: string) => void;

export const uploader = (
  type: "memoryStorage" = "memoryStorage",
  filePrefix: string,
  folderName?: string
) => {
  const storage = multer.memoryStorage();

  return multer({ storage });
};
