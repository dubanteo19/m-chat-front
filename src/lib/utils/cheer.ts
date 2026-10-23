export const getCheerUrl = (roomId: string | undefined): string => {
    if (!roomId) {
        throw new Error('roomId is required to generate cheer URL');
    }
    const storageHost = "http://192.168.1.81:9000";
    const prefix = 'mchat-public';
    return `${storageHost}/${prefix}/room/${roomId}/cheer.png`;
}