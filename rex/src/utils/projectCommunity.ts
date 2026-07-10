export type ProjectCommunityLinks = {
  telegramGroup: string;
  discordUrl?: string;
};

export function normalizeCommunityLinks(links: Partial<ProjectCommunityLinks>): ProjectCommunityLinks {
  return {
    telegramGroup: links.telegramGroup?.trim() ?? '',
    discordUrl: links.discordUrl?.trim() || undefined,
  };
}

export function hasRequiredTelegram(telegramGroup: string): boolean {
  return telegramGroup.trim().length > 0;
}
