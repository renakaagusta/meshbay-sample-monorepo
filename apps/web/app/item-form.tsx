"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ItemForm() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [statusText, setStatusText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitForm(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const trimmedName = itemName.trim();
    if (trimmedName === "") {
      setStatusText("Name is required.");
      return;
    }
    setBusy(true);
    setStatusText("");
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (!response.ok) {
        setStatusText(`Request failed (${response.status}).`);
        return;
      }
      setItemName("");
      setStatusText("Item added.");
      router.refresh();
    } catch {
      setStatusText("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submitForm}>
      <input
        value={itemName}
        onChange={(changeEvent) => setItemName(changeEvent.target.value)}
        placeholder="Item name"
        aria-label="Item name"
      />
      <button type="submit" disabled={busy}>
        {busy ? "Adding..." : "Add item"}
      </button>
      <p className="status">{statusText}</p>
    </form>
  );
}
