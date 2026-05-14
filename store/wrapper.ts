import { makeStore } from "./store";

// In Next.js App Router, next-redux-wrapper's useWrappedStore can trigger
// NextRouter-not-mounted issues during prerendering. For now we keep the
// Redux integration minimal and reliable by exporting a store factory.
export const initStore = makeStore;


