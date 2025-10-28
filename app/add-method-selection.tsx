import { useRouter } from 'expo-router';
import React from 'react';
import { AddMethodSelectionScreen } from '../src/screens/AddMethodSelectionScreen';

export default function AddMethodSelection() {
  const router = useRouter();

  const handleQRScan = () => {
    console.log('QR Scan pressed');
    router.push('/qr-scan');
  };

  const handleManualAdd = () => {
    console.log('Manual Add pressed');
    router.push('/add-product');
  };

  const handleBack = () => {
    console.log('Back pressed');
    router.back();
  };

  return (
    <AddMethodSelectionScreen
      onBack={handleBack}
      onManualAdd={handleManualAdd}
      onQRScan={handleQRScan}
    />
  );
}