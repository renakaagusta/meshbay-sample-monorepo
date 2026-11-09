import { API_VERSION } from "@meshbay/shared";
import ItemForm from "./item-form";
import { apiBaseURL, listItems } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await listItems();

  return (
    <main>
      <h1>meshbay-sample-monorepo</h1>
      <p>
        Next.js 15 from <code>apps/web</code>, reading <code>API_URL</code> at runtime: <code>{apiBaseURL()}</code>
      </p>
      <p>
        Shared contract <code>{API_VERSION}</code> from <code>packages/shared</code>, items served by{" "}
        <code>apps/api</code>.
      </p>
      <ItemForm />
      {items.length === 0 ? (
        <p className="empty">No items yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              #{item.id} {item.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
