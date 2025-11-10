import { UnrealModel } from "@/actions/unreal/models";

export const fallbackModels: UnrealModel[] = [
  {
    id: "gpt-4o-mini",
    owned_by: "github",
    modalities: ["text", "image"],
    capabilities: {
      chat: true,
      responses: true,
      images: true,
    },
  },
  {
    id: "gpt-4o",
    owned_by: "github",
    modalities: ["text", "image"],
    capabilities: {
      chat: true,
      responses: true,
      images: true,
    },
  },
];
