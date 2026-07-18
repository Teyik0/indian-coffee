import { notFound } from "@teyik0/furin";
import { route } from "./root";

export default route.page({
  loader: () => notFound({ message: "La page demandée a peut-être quitté la carte." }),
  component: () => null,
});
