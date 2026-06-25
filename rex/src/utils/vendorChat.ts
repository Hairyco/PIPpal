export type VendorChatTarget = {
  key: string;
  name: string;
  subtitle: string;
  avatar?: string;
  kind: 'studio' | 'talent';
};

export type ChatMessage = {
  id: string;
  from: 'founder' | 'vendor';
  text: string;
  time: string;
};

export function vendorChatKey(kind: 'studio' | 'talent', id: string): string {
  return `${kind}:${id}`;
}

export function openingMessage(target: VendorChatTarget): string {
  if (target.kind === 'studio') {
    return `Hi — thanks for reaching out from Rex. Happy to discuss ${target.subtitle.toLowerCase()}. Share your roadmap and we can scope timing and budget.`;
  }
  return `Hey! I saw your project on Rex. I can help with ${target.subtitle.toLowerCase()}. Tell me what you need and we can align on deliverables after launch.`;
}

export function demoReply(target: VendorChatTarget): string {
  if (target.kind === 'studio') {
    return "Sounds good. We can start with a discovery call — no commitment needed until your milestone wallet unlocks. Launch whenever you're ready; we'll finalise scope in this thread.";
  }
  return "Perfect. I'm available to start once the relevant milestone is funded. You can launch the coin now — we'll lock in hours and deliverables here.";
}
