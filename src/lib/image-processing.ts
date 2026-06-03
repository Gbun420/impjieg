export type ImageVariant = "logo" | "cover";

type ImageSpec = {
  width: number;
  height: number;
  mimeType: string;
  quality?: number;
};

const IMAGE_SPECS: Record<ImageVariant, ImageSpec> = {
  logo: {
    width: 512,
    height: 512,
    mimeType: "image/png",
  },
  cover: {
    width: 1600,
    height: 900,
    mimeType: "image/jpeg",
    quality: 0.9,
  },
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

function cropMetrics(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) {
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  if (sourceRatio > targetRatio) {
    const cropWidth = sourceHeight * targetRatio;
    return {
      sx: (sourceWidth - cropWidth) / 2,
      sy: 0,
      sw: cropWidth,
      sh: sourceHeight,
    };
  }

  const cropHeight = sourceWidth / targetRatio;
  return {
    sx: 0,
    sy: (sourceHeight - cropHeight) / 2,
    sw: sourceWidth,
    sh: cropHeight,
  };
}

export async function cropAndResizeImage(
  file: File,
  variant: ImageVariant
): Promise<File> {
  const spec = IMAGE_SPECS[variant];
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = spec.width;
    canvas.height = spec.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const { sx, sy, sw, sh } = cropMetrics(
      image.naturalWidth,
      image.naturalHeight,
      spec.width,
      spec.height
    );

    context.drawImage(image, sx, sy, sw, sh, 0, 0, spec.width, spec.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, spec.mimeType, spec.quality);
    });

    if (!blob) {
      throw new Error("Failed to prepare image for upload");
    }

    const extension = spec.mimeType === "image/png" ? "png" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");

    return new File([blob], `${baseName}.${extension}`, {
      type: spec.mimeType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
