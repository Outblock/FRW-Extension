import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QrScannerComponent = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('this is video ref ')
    if (!videoRef.current) return;
    console.log('video ref  true, ', videoRef)

    const qrScanner = new QrScanner(
      videoRef.current,
      result => console.log('decoded qr code:', result),
      { returnDetailedScanResult: true }
    );

    qrScanner.start()
      .catch(err => {
        console.error(err);
        setError('Camera access denied. Please allow camera access.');
      });

    return () => qrScanner.stop();
  }, []);

  const retryAccess = () => {
    setError('');
    // Re-initiate QR Scanner or refresh the page
  };

  return (
    <div>
      <video ref={videoRef}></video>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={retryAccess}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default QrScannerComponent;