import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import PageLoader from "../components/PageLoader";

export default function SuspenseLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}
