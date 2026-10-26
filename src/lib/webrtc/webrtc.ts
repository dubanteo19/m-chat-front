
type SignalMessage =
    | { eventType: 'RTC_OFFER'; sdp: RTCSessionDescriptionInit }
    | { eventType: 'RTC_ANSWER'; sdp: RTCSessionDescriptionInit }
    | { eventType: 'RTC_ICE_CANDIDATE'; candidate: RTCIceCandidateInit };

type PeerCallbacks = {
    sendSignal: (message: SignalMessage) => void;
    onStateChange?: (state: RTCPeerConnectionState) => void;
    onMessage?: (message: string) => void;
};

export class WebRTCConnection {
    private peer: RTCPeerConnection;
    private channel?: RTCDataChannel;
    private pendingCandidates: RTCIceCandidateInit[] = [];

    constructor(private callbacks: PeerCallbacks) {
        this.peer = new RTCPeerConnection({ iceServers: [] });

        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                callbacks.sendSignal({
                    eventType: 'RTC_ICE_CANDIDATE',
                    candidate: event.candidate.toJSON()
                });
            }
        };

        this.peer.onconnectionstatechange = () => {
            callbacks.onStateChange?.(this.peer.connectionState);
        };

        this.peer.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };
    }

    private setupDataChannel(channel: RTCDataChannel) {
        this.channel = channel;

        channel.onopen = () => console.log('P2P data channel opened');
        channel.onclose = () => console.log('P2P data channel closed');
        channel.onmessage = (event) => {
            this.callbacks.onMessage?.(String(event.data));
        };
    }

    async createOffer() {
        this.channel = this.peer.createDataChannel('chat');
        this.setupDataChannel(this.channel);


        console.log('Creating P2P offer...');
        const offer = await this.peer.createOffer();
        console.log("Offer created:", offer);
        await this.peer.setLocalDescription(offer);
        console.log("Local description set:", this.peer.localDescription);
        this.callbacks.sendSignal({
            eventType: 'RTC_OFFER',
            sdp: offer
        });
    }

    async handleSignal(message: SignalMessage) {
        switch (message.eventType) {
            case 'RTC_OFFER': {
                console.log('Received P2P offer:', message.sdp);
                await this.peer.setRemoteDescription(message.sdp);

                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);

                this.callbacks.sendSignal({
                    eventType: 'RTC_ANSWER',
                    sdp: answer
                });

                await this.flushCandidates();
                break;
            }

            case 'RTC_ANSWER':
                console.log('Received P2P answer:', message.sdp);
                await this.peer.setRemoteDescription(message.sdp);
                await this.flushCandidates();
                break;

            case 'RTC_ICE_CANDIDATE':
                console.log('Received P2P ICE candidate:', message.candidate);
                if (this.peer.remoteDescription) {
                    await this.peer.addIceCandidate(message.candidate);
                } else {
                    this.pendingCandidates.push(message.candidate);
                }
                break;
        }
    }

    private async flushCandidates() {
        for (const candidate of this.pendingCandidates) {
            await this.peer.addIceCandidate(candidate);
        }
        this.pendingCandidates = [];
    }

    sendMessage(message: string) {
        if (this.channel?.readyState !== 'open') {
            throw new Error('P2P data channel is not open');
        }

        this.channel.send(message);
    }
    async shareScreen() {
        console.log('Requesting screen sharing permission...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });

        const track = stream.getVideoTracks()[0];

        this.peer.addTrack(track, stream);

        track.onended = () => {
            console.log('Screen sharing stopped');
        };

        return stream;
    }
    close() {
        this.channel?.close();
        this.peer.close();
    }
}
