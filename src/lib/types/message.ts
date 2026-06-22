export type Message = {
    id: number;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
    sender: string;
    content: string;
    sentAt: string;
};