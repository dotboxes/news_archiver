export default function Loading() {
    return (
        <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
        </div>
    );
}
