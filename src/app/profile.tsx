import { Redirect } from "expo-router";

/** Legacy route — auth gate lives on `/` */
export default function ProfileRoute() {
  return <Redirect href="/" />;
}
