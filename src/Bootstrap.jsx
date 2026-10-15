import { useServiceWorker } from "./hooks/useServiceWorker";
import App from "./App";

export default function Bootstrap() {
  useServiceWorker();
  return <App />;
}
