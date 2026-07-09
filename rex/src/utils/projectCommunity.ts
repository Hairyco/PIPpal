export type ProjectCommunityLinks = {
  telegramGroup: string;
  discordUrl?: string;
  xUrl?: string;
  websiteUrl?: string;
};

export function normalizeCommunityLinks(links: Partial<ProjectCommunityLinks>): ProjectCommunityLinks {
  return {
    telegramGroup: links.telegramGroup?.trim() ?? '',
    discordUrl: links.discordUrl?.trim() || undefined,
    xUrl: links.xUrl?.trim() || undefined,
    websiteUrl: links.websiteUrl?.trim() || undefined,
  };
}

export function hasRequiredTelegram(telegramGroup: string): boolean {
  return telegramGroup.trim().length > 0;
}
