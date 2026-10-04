export async function submitContact(payload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readError(data));
  }
  return data;
}

function readError(data) {
  const detail = data?.detail;
  if (typeof detail === "string") {
    return clean(detail);
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return clean(detail.map((item) => item.msg).filter(Boolean).join(" "));
  }
  return "Something went wrong. Call us and we will take it from there.";
}

function clean(message) {
  return message.replace(/^Value error,\s*/i, "");
}
