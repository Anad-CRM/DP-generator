export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type UploadResult = {
  url: string;
  path: string;
};

export interface BackendAdapter {
  getCurrentUser(): Promise<AuthUser | null>;
  uploadImage(file: File, path: string): Promise<UploadResult>;
  removeBackground(imageUrl: string): Promise<string>;
  extractBrandColors(imageUrl: string): Promise<string[]>;
  suggestTemplate(prompt: string): Promise<string>;
}

export class LocalPrototypeBackend implements BackendAdapter {
  async getCurrentUser(): Promise<AuthUser | null> {
    return {
      id: "local-founder",
      name: "Local Studio",
      email: "studio@example.com"
    };
  }

  async uploadImage(file: File, path: string): Promise<UploadResult> {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    return { url, path };
  }

  async removeBackground(imageUrl: string): Promise<string> {
    return imageUrl;
  }

  async extractBrandColors(_imageUrl: string): Promise<string[]> {
    void _imageUrl;
    return ["#A855F7", "#22D3EE", "#FFFFFF"];
  }

  async suggestTemplate(prompt: string): Promise<string> {
    const normalized = prompt.toLowerCase();
    if (normalized.includes("campus")) return "campus";
    if (normalized.includes("game")) return "gaming";
    if (normalized.includes("speaker")) return "speaker";
    return "ai-startup";
  }
}
