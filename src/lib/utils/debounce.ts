export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const debounced = (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = undefined;
            fn(...args);
        }, delay);
    };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    };

    return debounced;
}

export function createAnimationTrigger(
    setActive: (active: boolean) => void,
    duration: number
) {
    let timeout: ReturnType<typeof setTimeout>;

    return () => {
        setActive(false);

        requestAnimationFrame(() => {
            setActive(true);

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setActive(false);
            }, duration);
        });
    };
}