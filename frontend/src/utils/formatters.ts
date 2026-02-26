export function formatINR(amount: number | bigint): string {
    const num = typeof amount === 'bigint' ? Number(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

export function formatDate(timestamp: bigint): string {
    // Motoko Time.now() returns nanoseconds
    const ms = Number(timestamp) / 1_000_000;
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(ms));
}
