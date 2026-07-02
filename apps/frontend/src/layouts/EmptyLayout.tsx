import * as React from "react";
import { Outlet } from "react-router-dom";

export const EmptyLayout: React.FC = () => {
  return <Outlet />;
};
export default EmptyLayout;
