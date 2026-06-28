import { tick } from 'svelte';

function createScrollService() {
	let container = $state<HTMLElement | null>(null);
	let isNearBottom = $state(true);

	function updateScrollState(threshold = 100) {
		if (!container) return;

		isNearBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
	}

	function scrollToMessage(messageId: number) {
		const element = document.getElementById(`msg-${messageId}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			element.classList.add('animate-pulse');
			setTimeout(() => element.classList.remove('animate-pulse'), 2000);
		}
	}
	function use(node: HTMLDivElement) {
		container = node;

		const onScroll = () => {
			updateScrollState();
		};

		node.addEventListener('scroll', onScroll);
		updateScrollState();

		return {
			destroy() {
				node.removeEventListener('scroll', onScroll);
				container = null;
			}
		};
	}

	function onIncomingMessage() {
		if (isNearBottom) {
			scrollToBottom();
		}
	}

	async function scrollToBottom() {
		await tick();

		container?.scrollTo({
			top: container.scrollHeight,
			behavior: 'smooth'
		});
	}

	return {
		get isNearBottom() {
			return isNearBottom;
		},
		use,
		onIncomingMessage,
		scrollToBottom,
		scrollToMessage
	};
}

export const scrollService = createScrollService();
