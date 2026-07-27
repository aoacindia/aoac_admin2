"use client";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 id="modal-title" className="text-lg font-semibold text-zinc-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
