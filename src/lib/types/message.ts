export type SenderInfo = {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    title: string | null;
};

export type RepliedMessageInfo = {
    id: number;
    senderName: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
};

export type Message = {
    id: number;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
    sender: SenderInfo; // Changed from plain string to structural object
    content: string;
    sentAt: string;
    isMine?: boolean;
    isUnsent: boolean; // New soft-delete tracker
    repliedTo: RepliedMessageInfo | null; // New context layout tracker
};