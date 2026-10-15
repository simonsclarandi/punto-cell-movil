import { Redirect } from 'expo-router';

export default function Index() {
  // Apenas arranca la app, redireccionamos a la solapa de inventario
  return <Redirect href="/inventario" />;
}