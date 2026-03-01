import WidgetTicker from "./WidgetTicker";

export const dynamic = "force-static";

export default function WidgetPage() {
  return (
    <div style={{ padding: "8px" }}>
      <WidgetTicker />
    </div>
  );
}
