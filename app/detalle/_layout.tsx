import { Stack } from 'expo-router';

export default function DetalleLayout() {
  return (
    // Esto le dice a Expo que las pantallas de detalle se apilen sin un header extra, 
    // ya que vos armaste tu propio header con el botón "Volver" en la UI.
    <Stack screenOptions={{ headerShown: false }} />
  );
}